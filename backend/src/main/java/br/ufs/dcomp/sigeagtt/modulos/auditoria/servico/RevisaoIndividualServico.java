package br.ufs.dcomp.sigeagtt.modulos.auditoria.servico;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.AchadoGatilhoDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.AtividadeDiscenteDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.AuditoriaAlunoDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.CorrigirAuditoriaRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.IniciarRevisaoRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.ProntuarioItemAuditoriaDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.RevisaoIndividualRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.SalvarRevisaoRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.AchadoGatilho;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.AtividadeAuditoria;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.RevisaoIndividual;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.ValidacaoDocente;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.AchadoGatilhoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.AtividadeAuditoriaRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.RevisaoIndividualRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.ValidacaoDocenteRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.cenario.modelo.ProntuarioSimulado;
import br.ufs.dcomp.sigeagtt.modulos.cenario.repositorio.ProntuarioSimuladoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.gtt.modelo.GatilhoGtt;
import br.ufs.dcomp.sigeagtt.modulos.gtt.repositorio.GatilhoGttRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.turma.repositorio.TurmaAlunoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.repositorio.UsuarioRepositorio;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class RevisaoIndividualServico {

    private final RevisaoIndividualRepositorio revisaoRepositorio;
    private final AchadoGatilhoRepositorio achadoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final ProntuarioSimuladoRepositorio prontuarioRepositorio;
    private final GatilhoGttRepositorio gatilhoRepositorio;
    private final AtividadeAuditoriaRepositorio atividadeRepositorio;
    private final TurmaAlunoRepositorio turmaAlunoRepositorio;
    private final ValidacaoDocenteRepositorio validacaoRepositorio;

    public RevisaoIndividualServico(RevisaoIndividualRepositorio revisaoRepositorio,
            AchadoGatilhoRepositorio achadoRepositorio,
            UsuarioRepositorio usuarioRepositorio,
            ProntuarioSimuladoRepositorio prontuarioRepositorio,
            GatilhoGttRepositorio gatilhoRepositorio,
            AtividadeAuditoriaRepositorio atividadeRepositorio,
            TurmaAlunoRepositorio turmaAlunoRepositorio,
            ValidacaoDocenteRepositorio validacaoRepositorio) {
        this.revisaoRepositorio = revisaoRepositorio;
        this.achadoRepositorio = achadoRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.prontuarioRepositorio = prontuarioRepositorio;
        this.gatilhoRepositorio = gatilhoRepositorio;
        this.atividadeRepositorio = atividadeRepositorio;
        this.turmaAlunoRepositorio = turmaAlunoRepositorio;
        this.validacaoRepositorio = validacaoRepositorio;
    }

    @Transactional(readOnly = true)
    public List<AtividadeDiscenteDTO> listarAtividadesDoAluno(Long alunoId) {
        List<AtividadeDiscenteDTO> resultado = new ArrayList<>();
        for (AtividadeAuditoria at : atividadeRepositorio.findAll()) {
            if (!turmaAlunoRepositorio.existsByTurmaIdAndAlunoId(at.getTurma().getId(), alunoId))
                continue;

            List<ProntuarioSimulado> prontuarios = prontuarioRepositorio.findByCenarioId(at.getCenario().getId());
            List<ProntuarioItemAuditoriaDTO> itensProntuarios = new ArrayList<>();

            for (ProntuarioSimulado p : prontuarios) {
                Optional<RevisaoIndividual> revisaoOpt = revisaoRepositorio
                        .findByAtividadeIdAndAlunoIdAndProntuarioId(at.getId(), alunoId, p.getId());

                Long revId = null;
                Boolean fin = false;
                Integer tempo = 0;
                int totalGat = 0;
                int totalDanos = 0;

                if (revisaoOpt.isPresent()) {
                    RevisaoIndividual rev = revisaoOpt.get();
                    revId = rev.getId();
                    fin = Boolean.TRUE.equals(rev.getFinalizada());
                    tempo = rev.getTempoGastoSegundos() != null ? rev.getTempoGastoSegundos() : 0;

                    List<AchadoGatilho> achados = achadoRepositorio.findByRevisaoIndividualId(revId);
                    totalGat = achados.size();
                    totalDanos = (int) achados.stream().filter(a -> Boolean.TRUE.equals(a.getConfirmouDano())).count();
                }

                itensProntuarios.add(new ProntuarioItemAuditoriaDTO(
                        p.getId(),
                        p.getNumeroAtendimento(),
                        p.getUnidadeHospitalar().getSigla(),
                        p.getIdadePaciente(),
                        p.getTempoPermanenciaDias(),
                        revId,
                        fin,
                        tempo,
                        totalGat,
                        totalDanos));
            }

            resultado.add(new AtividadeDiscenteDTO(
                    at.getId(),
                    at.getTitulo(),
                    at.getTurma().getId(),
                    at.getTurma().getCodigoDisciplina(),
                    at.getCenario().getId(),
                    at.getCenario().getTitulo(),
                    null,
                    null,
                    null,
                    at.getDataInicio(),
                    at.getDataFim(),
                    at.getTempoLimiteMinutos(),
                    at.getFinalizada(),
                    itensProntuarios));
        }

        return resultado;
    }

    @Transactional
    public RevisaoIndividualRespostaDTO obterOuIniciarRevisao(IniciarRevisaoRequisicaoDTO dto) {
        RevisaoIndividual revisao = revisaoRepositorio
                .findByAtividadeIdAndAlunoIdAndProntuarioId(dto.atividadeId(), dto.alunoId(), dto.prontuarioId())
                .orElseGet(() -> {
                    AtividadeAuditoria atividade = atividadeRepositorio.findById(dto.atividadeId())
                            .orElseThrow(
                                    () -> new NoSuchElementException("Atividade não encontrada: " + dto.atividadeId()));
                    Usuario aluno = usuarioRepositorio.findById(dto.alunoId())
                            .orElseThrow(() -> new NoSuchElementException("Aluno não encontrado: " + dto.alunoId()));
                    ProntuarioSimulado prontuario = prontuarioRepositorio.findById(dto.prontuarioId())
                            .orElseThrow(() -> new NoSuchElementException(
                                    "Prontuário não encontrado: " + dto.prontuarioId()));

                    if (!turmaAlunoRepositorio.existsByTurmaIdAndAlunoId(atividade.getTurma().getId(), aluno.getId())) {
                        throw new IllegalArgumentException("O aluno não está matriculado na turma desta atividade.");
                    }

                    RevisaoIndividual nova = new RevisaoIndividual();
                    nova.setAtividade(atividade);
                    nova.setAluno(aluno);
                    nova.setProntuario(prontuario);
                    nova.setTempoGastoSegundos(0);
                    nova.setFinalizada(false);
                    return revisaoRepositorio.save(nova);
                });

        return converterParaDTO(revisao);
    }

    @Transactional(readOnly = true)
    public List<AuditoriaAlunoDTO> listarAuditoriasDaAtividade(Long atividadeId) {
        AtividadeAuditoria atividade = atividadeRepositorio.findById(atividadeId)
                .orElseThrow(() -> new NoSuchElementException("Atividade não encontrada: " + atividadeId));

        return turmaAlunoRepositorio.findByTurmaId(atividade.getTurma().getId()).stream()
                .map(vinculo -> new AuditoriaAlunoDTO(
                        vinculo.getAluno().getId(),
                        vinculo.getAluno().getNomeCompleto(),
                        vinculo.getAluno().getMatriculaSigaa(),
                        revisaoRepositorio.findByAtividadeIdAndAlunoId(atividadeId, vinculo.getAluno().getId()).stream()
                                .map(revisao -> converterParaDTO(revisao))
                                .toList()))
                .toList();
    }

    @Transactional
    public RevisaoIndividualRespostaDTO corrigirAuditoria(Long revisaoId, Long professorId,
            CorrigirAuditoriaRequisicaoDTO dto) {
        RevisaoIndividual revisao = revisaoRepositorio.findById(revisaoId)
                .orElseThrow(() -> new NoSuchElementException("Revisão individual não encontrada: " + revisaoId));
        Usuario professor = usuarioRepositorio.findById(professorId)
                .orElseThrow(() -> new NoSuchElementException("Professor não encontrado: " + professorId));
        if (professor.getPerfil() != PerfilUsuario.PROFESSOR) {
            throw new IllegalArgumentException("Apenas PROFESSOR pode corrigir auditorias.");
        }
        if (revisao.getAtividade() == null
                || !revisao.getAtividade().getTurma().getProfessorResponsavel().getId().equals(professorId)) {
            throw new IllegalArgumentException("O professor não é responsável pela turma desta auditoria.");
        }

        ValidacaoDocente validacao = validacaoRepositorio.findByRevisaoIndividualId(revisaoId)
                .orElseGet(ValidacaoDocente::new);
        validacao.setRevisaoIndividual(revisao);
        validacao.setProfessorValidador(professor);
        validacao.setParecerFormativo(dto.parecerDocente().trim());
        validacao.setNota(dto.nota());
        validacao.setHomologado(dto.homologada());
        validacaoRepositorio.save(validacao);
        return converterParaDTO(revisao);
    }

    @Transactional
    public RevisaoIndividualRespostaDTO salvarAchadosETempo(Long id, SalvarRevisaoRequisicaoDTO dto) {
        RevisaoIndividual revisao = revisaoRepositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Revisão individual não encontrada: " + id));

        if (Boolean.TRUE.equals(revisao.getFinalizada())) {
            throw new IllegalStateException(
                    "Esta auditoria individual já foi finalizada e não pode mais ser alterada.");
        }

        revisao.setTempoGastoSegundos(dto.tempoGastoSegundos());

        if (Boolean.TRUE.equals(dto.finalizar())) {
            revisao.setFinalizada(true);
            revisao.setDataSubmissao(LocalDateTime.now());
        }

        achadoRepositorio.deleteByRevisaoIndividualId(revisao.getId());

        if (dto.achados() != null && !dto.achados().isEmpty()) {
            for (AchadoGatilhoDTO item : dto.achados()) {
                GatilhoGtt gatilho = gatilhoRepositorio.findById(item.gatilhoId())
                        .orElseThrow(() -> new NoSuchElementException("Gatilho não encontrado: " + item.gatilhoId()));

                AchadoGatilho a = new AchadoGatilho();
                a.setRevisaoIndividual(revisao);
                a.setGatilho(gatilho);
                a.setConfirmouDano(Boolean.TRUE.equals(item.confirmouDano()));
                a.setJustificativaDano(item.justificativaDano());
                a.setDanoPresenteAdmissao(Boolean.TRUE.equals(item.danoPresenteAdmissao()));
                a.setGravidade(Boolean.TRUE.equals(item.confirmouDano()) ? item.gravidade() : null);

                achadoRepositorio.save(a);
            }
        }

        RevisaoIndividual atualizada = revisaoRepositorio.save(revisao);
        return converterParaDTO(atualizada);
    }

    private RevisaoIndividualRespostaDTO converterParaDTO(RevisaoIndividual r) {
        List<AchadoGatilho> achadosEntidade = achadoRepositorio.findByRevisaoIndividualId(r.getId());
        List<AchadoGatilhoDTO> achadosDTO = achadosEntidade.stream().map(a -> new AchadoGatilhoDTO(
                a.getId(),
                a.getGatilho().getId(),
                a.getGatilho().getCodigo(),
                a.getGatilho().getDescricao(),
                a.getGatilho().getModulo().getNome(),
                a.getConfirmouDano(),
                a.getJustificativaDano(),
                a.getDanoPresenteAdmissao(),
                a.getGravidade())).toList();

        ValidacaoDocente validacao = validacaoRepositorio.findByRevisaoIndividualId(r.getId()).orElse(null);
        return new RevisaoIndividualRespostaDTO(
                r.getId(),
                r.getAtividade() != null ? r.getAtividade().getId() : null,
                r.getAtividade() != null ? r.getAtividade().getTitulo() : null,
                r.getAluno().getId(),
                r.getAluno().getNomeCompleto(),
                r.getProntuario().getId(),
                r.getProntuario().getNumeroAtendimento(),
                r.getTempoGastoSegundos(),
                r.getFinalizada(),
                r.getDataSubmissao(),
                achadosDTO,
                validacao != null ? validacao.getParecerFormativo() : null,
                validacao != null ? validacao.getNota() : null,
                validacao != null && Boolean.TRUE.equals(validacao.getHomologado()));
    }

    @Transactional(readOnly = true)
    public RevisaoIndividualRespostaDTO buscarPorId(Long id) {
        RevisaoIndividual revisao = revisaoRepositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Revisão individual não encontrada: " + id));
        return converterParaDTO(revisao);
    }

    @Transactional(readOnly = true)
    public List<RevisaoIndividualRespostaDTO> listarMinhasNotas(Long alunoId) {
        return revisaoRepositorio.findByAlunoId(alunoId).stream()
                .filter(r -> Boolean.TRUE.equals(r.getFinalizada()))
                .map(this::converterParaDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RevisaoIndividualRespostaDTO> listarPorProfessor(Long professorId) {
        return revisaoRepositorio.findByProfessorId(professorId).stream()
                .filter(r -> Boolean.TRUE.equals(r.getFinalizada()))
                .map(this::converterParaDTO)
                .toList();
    }
}
