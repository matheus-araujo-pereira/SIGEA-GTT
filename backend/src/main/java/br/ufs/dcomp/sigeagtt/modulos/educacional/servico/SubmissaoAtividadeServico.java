package br.ufs.dcomp.sigeagtt.modulos.educacional.servico;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.CategoriaEventoAdverso;
import br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio.CategoriaEventoAdversoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.*;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.*;
import br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio.*;
import br.ufs.dcomp.sigeagtt.modulos.gtt.modelo.GatilhoGtt;
import br.ufs.dcomp.sigeagtt.modulos.gtt.repositorio.GatilhoGttRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SubmissaoAtividadeServico {

    private final SubmissaoAtividadeRepositorio submissaoRepositorio;
    private final AtividadeEducacionalRepositorio atividadeRepositorio;
    private final GatilhoGttRepositorio gatilhoRepositorio;
    private final CategoriaEventoAdversoRepositorio categoriaRepositorio;
    private final SubmissaoGatilhoRepositorio submissaoGatilhoRepositorio;
    private final SubmissaoIshikawaRepositorio submissaoIshikawaRepositorio;
    private final SubmissaoPlano5w3hRepositorio submissaoPlano5w3hRepositorio;
    private final SubmissaoPdcaRepositorio submissaoPdcaRepositorio;

    public SubmissaoAtividadeServico(
            SubmissaoAtividadeRepositorio submissaoRepositorio,
            AtividadeEducacionalRepositorio atividadeRepositorio,
            GatilhoGttRepositorio gatilhoRepositorio,
            CategoriaEventoAdversoRepositorio categoriaRepositorio,
            SubmissaoGatilhoRepositorio submissaoGatilhoRepositorio,
            SubmissaoIshikawaRepositorio submissaoIshikawaRepositorio,
            SubmissaoPlano5w3hRepositorio submissaoPlano5w3hRepositorio,
            SubmissaoPdcaRepositorio submissaoPdcaRepositorio) {
        this.submissaoRepositorio = submissaoRepositorio;
        this.atividadeRepositorio = atividadeRepositorio;
        this.gatilhoRepositorio = gatilhoRepositorio;
        this.categoriaRepositorio = categoriaRepositorio;
        this.submissaoGatilhoRepositorio = submissaoGatilhoRepositorio;
        this.submissaoIshikawaRepositorio = submissaoIshikawaRepositorio;
        this.submissaoPlano5w3hRepositorio = submissaoPlano5w3hRepositorio;
        this.submissaoPdcaRepositorio = submissaoPdcaRepositorio;
    }

    @Transactional(readOnly = true)
    public List<MinhaAtividadeItemDTO> listarMinhasAtividades(Usuario alunoLogado) {
        List<AtividadeEducacional> atividades = atividadeRepositorio.findAtividadesParaAluno(alunoLogado.getId());
        List<SubmissaoAtividade> minhasSubs = submissaoRepositorio
                .findByAlunoIdOrderByDataInicioDesc(alunoLogado.getId());
        Map<Long, SubmissaoAtividade> mapaSubs = minhasSubs.stream()
                .collect(Collectors.toMap(s -> s.getAtividade().getId(), s -> s, (s1, s2) -> s1));

        return atividades.stream().map(a -> {
            SubmissaoAtividade sub = mapaSubs.get(a.getId());
            return new MinhaAtividadeItemDTO(
                    a.getId(),
                    a.getTitulo(),
                    a.getTurma().getId(),
                    a.getTurma().getCodigoDisciplina(),
                    a.getTurma().getNomeDisciplina(),
                    a.getTurma().getProfessorResponsavel().getNomeCompleto(),
                    a.getCasoClinico().getId(),
                    a.getCasoClinico().getTitulo(),
                    a.getCasoClinico().getUnidadeHospitalar().getSigla(),
                    a.getDataInicio(),
                    a.getDataFim(),
                    a.getTempoLimiteMinutos(),
                    sub != null ? sub.getId() : null,
                    sub != null ? sub.getStatus() : null,
                    sub != null ? sub.getNota() : null,
                    sub != null ? sub.getTempoGastoSegundos() : 0,
                    sub != null ? sub.getDataSubmissao() : null,
                    sub != null ? sub.getDataAvaliacao() : null);
        }).toList();
    }

    @Transactional
    public SubmissaoDTO iniciarOuContinuar(Long atividadeId, Usuario alunoLogado) {
        AtividadeEducacional atividade = atividadeRepositorio.findById(atividadeId)
                .orElseThrow(() -> new IllegalArgumentException("Atividade não encontrada"));

        SubmissaoAtividade submissao = submissaoRepositorio
                .findByAtividadeIdAndAlunoId(atividadeId, alunoLogado.getId())
                .orElseGet(() -> {
                    SubmissaoAtividade nova = new SubmissaoAtividade();
                    nova.setAtividade(atividade);
                    nova.setAluno(alunoLogado);
                    nova.setStatus(StatusSubmissao.EM_ANDAMENTO);
                    nova.setTempoGastoSegundos(0);
                    nova.setDataInicio(LocalDateTime.now());
                    return submissaoRepositorio.save(nova);
                });

        return converterParaDTO(submissao);
    }

    @Transactional(readOnly = true)
    public SubmissaoDTO buscarSubmissao(Long submissaoId, Usuario usuarioLogado) {
        SubmissaoAtividade sub = submissaoRepositorio.findById(submissaoId)
                .orElseThrow(() -> new IllegalArgumentException("Submissão não encontrada (ID: " + submissaoId + ")"));

        validarAcessoSubmissao(sub, usuarioLogado);
        return converterParaDTO(sub);
    }

    @Transactional
    public SubmissaoDTO salvarProgresso(Long submissaoId, SalvarSubmissaoDTO dto, Usuario alunoLogado) {
        SubmissaoAtividade sub = submissaoRepositorio.findById(submissaoId)
                .orElseThrow(() -> new IllegalArgumentException("Submissão não encontrada"));

        if (!sub.getAluno().getId().equals(alunoLogado.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para alterar esta submissão.");
        }

        if (sub.getStatus() == StatusSubmissao.AVALIADA) {
            throw new IllegalArgumentException(
                    "Esta atividade já foi avaliada pelo professor e não pode ser modificada.");
        }

        if (sub.getStatus() == StatusSubmissao.SUBMETIDA && Boolean.FALSE.equals(dto.finalizar())) {
            throw new IllegalArgumentException("Esta atividade já foi finalizada e entregue.");
        }

        if (dto.tempoGastoSegundos() != null) {
            sub.setTempoGastoSegundos(dto.tempoGastoSegundos());
        }

        // Validação estrita se for finalizar
        if (Boolean.TRUE.equals(dto.finalizar())) {
            if (dto.achadosGatilhos() == null || dto.achadosGatilhos().isEmpty()) {
                throw new IllegalArgumentException(
                        "Para finalizar a atividade, é obrigatório apontar os gatilhos investigados no prontuário.");
            }
            if (dto.ishikawa() == null || dto.ishikawa().efeitoPrincipal() == null
                    || dto.ishikawa().efeitoPrincipal().trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "Para finalizar a atividade, é obrigatório preencher o Diagrama de Ishikawa (Efeito Principal).");
            }
            if (dto.planos5w3h() == null || dto.planos5w3h().isEmpty()) {
                throw new IllegalArgumentException(
                        "Para finalizar a atividade, é obrigatório cadastrar pelo menos uma ação no Plano 5W3H.");
            }
            if (dto.pdca() == null ||
                    dto.pdca().planejar() == null || dto.pdca().planejar().trim().isEmpty() ||
                    dto.pdca().fazer() == null || dto.pdca().fazer().trim().isEmpty() ||
                    dto.pdca().checar() == null || dto.pdca().checar().trim().isEmpty() ||
                    dto.pdca().agir() == null || dto.pdca().agir().trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "Para finalizar a atividade, é obrigatório preencher todas as 4 fases do Ciclo PDCA.");
            }

            sub.setStatus(StatusSubmissao.SUBMETIDA);
            sub.setDataSubmissao(LocalDateTime.now());
        }

        // 1. Salvar Gatilhos
        if (dto.achadosGatilhos() != null) {
            submissaoGatilhoRepositorio.deleteBySubmissaoId(sub.getId());
            sub.getAchadosGatilhos().clear();

            for (SubmissaoGatilhoDTO aDto : dto.achadosGatilhos()) {
                GatilhoGtt gat = gatilhoRepositorio.findById(aDto.gatilhoId())
                        .orElseThrow(() -> new IllegalArgumentException("Gatilho inválido: " + aDto.gatilhoId()));

                CategoriaEventoAdverso cat = aDto.categoriaEaId() != null
                        ? categoriaRepositorio.findById(aDto.categoriaEaId()).orElse(null)
                        : null;

                SubmissaoGatilho g = new SubmissaoGatilho();
                g.setSubmissao(sub);
                g.setGatilho(gat);
                g.setCategoriaEa(cat);
                g.setConfirmouDano(Boolean.TRUE.equals(aDto.confirmouDano()));
                g.setJustificativaDano(aDto.justificativaDano());
                g.setDanoPresenteAdmissao(Boolean.TRUE.equals(aDto.danoPresenteAdmissao()));
                g.setGravidade(aDto.gravidade());
                sub.getAchadosGatilhos().add(g);
            }
        }

        // 2. Salvar Ishikawa
        if (dto.ishikawa() != null) {
            SubmissaoIshikawa ishikawa = submissaoIshikawaRepositorio.findBySubmissaoId(sub.getId())
                    .orElseGet(() -> {
                        SubmissaoIshikawa novo = new SubmissaoIshikawa();
                        novo.setSubmissao(sub);
                        return novo;
                    });
            ishikawa.setEfeitoPrincipal(dto.ishikawa().efeitoPrincipal());
            ishikawa.setMetodo(dto.ishikawa().metodo());
            ishikawa.setMaoDeObra(dto.ishikawa().maoDeObra());
            ishikawa.setMaterial(dto.ishikawa().material());
            ishikawa.setMedida(dto.ishikawa().medida());
            ishikawa.setMeioAmbiente(dto.ishikawa().meioAmbiente());
            ishikawa.setMaquina(dto.ishikawa().maquina());
            submissaoIshikawaRepositorio.save(ishikawa);
            sub.setIshikawa(ishikawa);
        }

        // 3. Salvar 5W3H
        if (dto.planos5w3h() != null) {
            submissaoPlano5w3hRepositorio.deleteBySubmissaoId(sub.getId());
            sub.getPlanos5w3h().clear();

            for (SubmissaoPlano5w3hDTO pDto : dto.planos5w3h()) {
                SubmissaoPlano5w3h p = new SubmissaoPlano5w3h();
                p.setSubmissao(sub);
                p.setOQue(pDto.oQue());
                p.setPorQue(pDto.porQue());
                p.setQuem(pDto.quem());
                p.setOnde(pDto.onde());
                p.setQuando(pDto.quando());
                p.setComo(pDto.como());
                p.setQuantoCusta(pDto.quantoCusta());
                p.setComoMedir(pDto.comoMedir());
                sub.getPlanos5w3h().add(p);
            }
        }

        // 4. Salvar PDCA
        if (dto.pdca() != null) {
            SubmissaoPdca pdca = submissaoPdcaRepositorio.findBySubmissaoId(sub.getId())
                    .orElseGet(() -> {
                        SubmissaoPdca novo = new SubmissaoPdca();
                        novo.setSubmissao(sub);
                        return novo;
                    });
            pdca.setPlanejar(dto.pdca().planejar());
            pdca.setFazer(dto.pdca().fazer());
            pdca.setChecar(dto.pdca().checar());
            pdca.setAgir(dto.pdca().agir());
            submissaoPdcaRepositorio.save(pdca);
            sub.setPdca(pdca);
        }

        SubmissaoAtividade atualizada = submissaoRepositorio.save(sub);
        return converterParaDTO(atualizada);
    }

    @Transactional
    public SubmissaoDTO avaliar(Long submissaoId, AvaliarSubmissaoDTO dto, Usuario professorLogado) {
        SubmissaoAtividade sub = submissaoRepositorio.findById(submissaoId)
                .orElseThrow(() -> new IllegalArgumentException("Submissão não encontrada"));

        if (professorLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR &&
                !sub.getAtividade().getTurma().getProfessorResponsavel().getId().equals(professorLogado.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para avaliar submissões desta turma.");
        }

        sub.setStatus(StatusSubmissao.AVALIADA);
        sub.setProfessorCorretor(professorLogado);
        sub.setNota(dto.nota());
        sub.setParecerDocente(dto.parecerDocente());
        sub.setDataAvaliacao(LocalDateTime.now());

        SubmissaoAtividade avaliada = submissaoRepositorio.save(sub);
        return converterParaDTO(avaliada);
    }

    @Transactional(readOnly = true)
    public List<SubmissaoDTO> listarPendentesCorrecao(Usuario professorLogado) {
        List<SubmissaoAtividade> pendentes;
        if (professorLogado.getPerfil() == PerfilUsuario.ADMINISTRADOR) {
            pendentes = submissaoRepositorio.findAll().stream()
                    .filter(s -> s.getStatus() == StatusSubmissao.SUBMETIDA)
                    .toList();
        } else {
            pendentes = submissaoRepositorio.findByProfessorAndStatus(professorLogado.getId(),
                    StatusSubmissao.SUBMETIDA);
        }
        return pendentes.stream().map(this::converterParaDTO).toList();
    }

    private void validarAcessoSubmissao(SubmissaoAtividade sub, Usuario usuario) {
        if (usuario.getPerfil() == PerfilUsuario.ADMINISTRADOR) {
            return;
        }
        if (usuario.getPerfil() == PerfilUsuario.PROFESSOR) {
            if (!sub.getAtividade().getTurma().getProfessorResponsavel().getId().equals(usuario.getId())) {
                throw new IllegalArgumentException("Acesso não autorizado a esta submissão.");
            }
            return;
        }
        if (!sub.getAluno().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Acesso restrito ao próprio aluno.");
        }
    }

    private SubmissaoDTO converterParaDTO(SubmissaoAtividade s) {
        List<SubmissaoGatilho> gatilhos = s.getAchadosGatilhos() != null ? s.getAchadosGatilhos()
                : submissaoGatilhoRepositorio.findBySubmissaoId(s.getId());
        List<SubmissaoGatilhoDTO> gatilhosDTO = gatilhos.stream().map(g -> new SubmissaoGatilhoDTO(
                g.getId(),
                g.getGatilho().getId(),
                g.getGatilho().getCodigo(),
                g.getGatilho().getDescricao(),
                g.getGatilho().getModulo() != null ? g.getGatilho().getModulo().getCodigo() : null,
                g.getGatilho().getModulo() != null ? g.getGatilho().getModulo().getNome() : null,
                g.getCategoriaEa() != null ? g.getCategoriaEa().getId() : null,
                g.getCategoriaEa() != null ? g.getCategoriaEa().getNome() : null,
                g.getConfirmouDano(),
                g.getJustificativaDano(),
                g.getDanoPresenteAdmissao(),
                g.getGravidade())).toList();

        SubmissaoIshikawa ishikawa = s.getIshikawa() != null ? s.getIshikawa()
                : submissaoIshikawaRepositorio.findBySubmissaoId(s.getId()).orElse(null);
        SubmissaoIshikawaDTO ishikawaDTO = ishikawa != null ? new SubmissaoIshikawaDTO(
                ishikawa.getEfeitoPrincipal(),
                ishikawa.getMetodo(),
                ishikawa.getMaoDeObra(),
                ishikawa.getMaterial(),
                ishikawa.getMedida(),
                ishikawa.getMeioAmbiente(),
                ishikawa.getMaquina()) : null;

        List<SubmissaoPlano5w3h> planos = s.getPlanos5w3h() != null ? s.getPlanos5w3h()
                : submissaoPlano5w3hRepositorio.findBySubmissaoId(s.getId());
        List<SubmissaoPlano5w3hDTO> planosDTO = planos.stream().map(p -> new SubmissaoPlano5w3hDTO(
                p.getId(),
                p.getOQue(),
                p.getPorQue(),
                p.getQuem(),
                p.getOnde(),
                p.getQuando(),
                p.getComo(),
                p.getQuantoCusta(),
                p.getComoMedir())).toList();

        SubmissaoPdca pdca = s.getPdca() != null ? s.getPdca()
                : submissaoPdcaRepositorio.findBySubmissaoId(s.getId()).orElse(null);
        SubmissaoPdcaDTO pdcaDTO = pdca != null ? new SubmissaoPdcaDTO(
                pdca.getPlanejar(),
                pdca.getFazer(),
                pdca.getChecar(),
                pdca.getAgir()) : null;

        return SubmissaoDTO.deEntidade(s, gatilhosDTO, ishikawaDTO, planosDTO, pdcaDTO);
    }

    @Transactional(readOnly = true)
    public List<CategoriaEventoAdverso> listarCategoriasAtivas() {
        return categoriaRepositorio.findByAtivaTrue();
    }
}
