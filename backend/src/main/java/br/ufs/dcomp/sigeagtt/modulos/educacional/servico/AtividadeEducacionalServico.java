package br.ufs.dcomp.sigeagtt.modulos.educacional.servico;

import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.*;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.AtividadeEducacional;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.CasoClinico;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.StatusSubmissao;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.SubmissaoAtividade;
import br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio.AtividadeEducacionalRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio.CasoClinicoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio.SubmissaoAtividadeRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.turma.modelo.Turma;
import br.ufs.dcomp.sigeagtt.modulos.turma.modelo.TurmaAluno;
import br.ufs.dcomp.sigeagtt.modulos.turma.repositorio.TurmaAlunoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.turma.repositorio.TurmaRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AtividadeEducacionalServico {

    private final AtividadeEducacionalRepositorio atividadeRepositorio;
    private final TurmaRepositorio turmaRepositorio;
    private final TurmaAlunoRepositorio turmaAlunoRepositorio;
    private final CasoClinicoRepositorio casoRepositorio;
    private final SubmissaoAtividadeRepositorio submissaoRepositorio;

    public AtividadeEducacionalServico(
            AtividadeEducacionalRepositorio atividadeRepositorio,
            TurmaRepositorio turmaRepositorio,
            TurmaAlunoRepositorio turmaAlunoRepositorio,
            CasoClinicoRepositorio casoRepositorio,
            SubmissaoAtividadeRepositorio submissaoRepositorio) {
        this.atividadeRepositorio = atividadeRepositorio;
        this.turmaRepositorio = turmaRepositorio;
        this.turmaAlunoRepositorio = turmaAlunoRepositorio;
        this.casoRepositorio = casoRepositorio;
        this.submissaoRepositorio = submissaoRepositorio;
    }

    @Transactional(readOnly = true)
    public List<AtividadeEducacionalDTO> listar(Usuario usuarioLogado) {
        List<AtividadeEducacional> atividades;
        if (usuarioLogado.getPerfil() == PerfilUsuario.ADMINISTRADOR) {
            atividades = atividadeRepositorio.findAllByOrderByCriadaEmDesc();
        } else {
            atividades = atividadeRepositorio.findByProfessorId(usuarioLogado.getId());
        }

        return atividades.stream().map(a -> {
            int totalAlunos = (int) turmaAlunoRepositorio.countByTurmaId(a.getTurma().getId());
            List<SubmissaoAtividade> subs = submissaoRepositorio.findByAtividadeId(a.getId());
            int totalSubmissoes = (int) subs.stream().filter(s -> s.getStatus() != StatusSubmissao.EM_ANDAMENTO)
                    .count();
            int totalAvaliadas = (int) subs.stream().filter(s -> s.getStatus() == StatusSubmissao.AVALIADA).count();
            return AtividadeEducacionalDTO.deEntidade(a, totalAlunos, totalSubmissoes, totalAvaliadas);
        }).toList();
    }

    @Transactional(readOnly = true)
    public AtividadeEducacionalDTO buscarPorId(Long id) {
        AtividadeEducacional a = atividadeRepositorio.findById(id)
                .orElseThrow(
                        () -> new IllegalArgumentException("Atividade educacional não encontrada (ID: " + id + ")"));
        int totalAlunos = (int) turmaAlunoRepositorio.countByTurmaId(a.getTurma().getId());
        List<SubmissaoAtividade> subs = submissaoRepositorio.findByAtividadeId(a.getId());
        int totalSubmissoes = (int) subs.stream().filter(s -> s.getStatus() != StatusSubmissao.EM_ANDAMENTO).count();
        int totalAvaliadas = (int) subs.stream().filter(s -> s.getStatus() == StatusSubmissao.AVALIADA).count();
        return AtividadeEducacionalDTO.deEntidade(a, totalAlunos, totalSubmissoes, totalAvaliadas);
    }

    @Transactional(readOnly = true)
    public PainelAtividadeDTO buscarPainelAtividade(Long atividadeId, Usuario usuarioLogado) {
        AtividadeEducacional a = atividadeRepositorio.findById(atividadeId)
                .orElseThrow(() -> new IllegalArgumentException("Atividade não encontrada"));

        if (usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR &&
                !a.getTurma().getProfessorResponsavel().getId().equals(usuarioLogado.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para gerenciar esta atividade.");
        }

        List<TurmaAluno> matriculas = turmaAlunoRepositorio.findByTurmaId(a.getTurma().getId());
        List<SubmissaoAtividade> subs = submissaoRepositorio.findByAtividadeId(a.getId());
        Map<Long, SubmissaoAtividade> mapaSubs = subs.stream()
                .collect(Collectors.toMap(s -> s.getAluno().getId(), s -> s, (s1, s2) -> s1));

        List<AlunoProgressoDTO> alunos = new ArrayList<>();
        int totalSubmissoes = 0;
        int totalPendentesCorrecao = 0;
        int totalAvaliadas = 0;
        BigDecimal somaNotas = BigDecimal.ZERO;

        for (TurmaAluno ta : matriculas) {
            Usuario aluno = ta.getAluno();
            SubmissaoAtividade sub = mapaSubs.get(aluno.getId());

            if (sub == null) {
                alunos.add(new AlunoProgressoDTO(
                        aluno.getId(), aluno.getNomeCompleto(), aluno.getEmail(), aluno.getMatriculaSigaa(),
                        null, null, null, null, null, null, null));
            } else {
                if (sub.getStatus() == StatusSubmissao.SUBMETIDA) {
                    totalSubmissoes++;
                    totalPendentesCorrecao++;
                } else if (sub.getStatus() == StatusSubmissao.AVALIADA) {
                    totalSubmissoes++;
                    totalAvaliadas++;
                    if (sub.getNota() != null) {
                        somaNotas = somaNotas.add(sub.getNota());
                    }
                }

                alunos.add(new AlunoProgressoDTO(
                        aluno.getId(), aluno.getNomeCompleto(), aluno.getEmail(), aluno.getMatriculaSigaa(),
                        sub.getId(), sub.getStatus(), sub.getTempoGastoSegundos(), sub.getDataSubmissao(),
                        sub.getNota(), sub.getParecerDocente(), sub.getDataAvaliacao()));
            }
        }

        BigDecimal mediaNotas = totalAvaliadas > 0
                ? somaNotas.divide(BigDecimal.valueOf(totalAvaliadas), 2, RoundingMode.HALF_UP)
                : null;

        AtividadeEducacionalDTO atvDTO = AtividadeEducacionalDTO.deEntidade(a, matriculas.size(), totalSubmissoes,
                totalAvaliadas);
        CasoClinicoDTO casoDTO = CasoClinicoDTO.deEntidade(a.getCasoClinico());

        return new PainelAtividadeDTO(
                atvDTO,
                casoDTO,
                matriculas.size(),
                totalSubmissoes,
                totalPendentesCorrecao,
                totalAvaliadas,
                mediaNotas,
                alunos);
    }

    @Transactional
    public AtividadeEducacionalDTO salvar(SalvarAtividadeDTO dto, Usuario professorLogado) {
        Turma turma = turmaRepositorio.findById(dto.turmaId())
                .orElseThrow(() -> new IllegalArgumentException("Turma não encontrada"));

        if (professorLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR &&
                !turma.getProfessorResponsavel().getId().equals(professorLogado.getId())) {
            throw new IllegalArgumentException("Você só pode criar atividades para as suas turmas.");
        }

        CasoClinico caso = casoRepositorio.findById(dto.casoClinicoId())
                .orElseThrow(() -> new IllegalArgumentException("Caso clínico não encontrado"));

        if (professorLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR &&
                caso.getProfessorCriador() != null &&
                !caso.getProfessorCriador().getId().equals(professorLogado.getId())) {
            throw new IllegalArgumentException("Você só pode vincular casos clínicos criados por você.");
        }

        AtividadeEducacional a = new AtividadeEducacional();
        a.setTurma(turma);
        a.setCasoClinico(caso);
        a.setTitulo(dto.titulo());
        a.setOrientacoesPedagogicas(dto.orientacoesPedagogicas());
        a.setDataInicio(dto.dataInicio());
        a.setDataFim(dto.dataFim());
        a.setTempoLimiteMinutos(dto.tempoLimiteMinutos() != null ? dto.tempoLimiteMinutos() : 20);
        a.setAtiva(dto.ativa() != null ? dto.ativa() : true);

        AtividadeEducacional salva = atividadeRepositorio.save(a);
        int totalAlunos = (int) turmaAlunoRepositorio.countByTurmaId(turma.getId());
        return AtividadeEducacionalDTO.deEntidade(salva, totalAlunos, 0, 0);
    }

    @Transactional
    public AtividadeEducacionalDTO atualizar(Long id, SalvarAtividadeDTO dto, Usuario usuarioLogado) {
        AtividadeEducacional a = atividadeRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Atividade educacional não encontrada"));

        if (usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR &&
                !a.getTurma().getProfessorResponsavel().getId().equals(usuarioLogado.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para editar esta atividade.");
        }

        Turma turma = turmaRepositorio.findById(dto.turmaId())
                .orElseThrow(() -> new IllegalArgumentException("Turma não encontrada"));

        if (usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR &&
                !turma.getProfessorResponsavel().getId().equals(usuarioLogado.getId())) {
            throw new IllegalArgumentException("Você só pode vincular a atividade às suas próprias turmas.");
        }

        CasoClinico caso = casoRepositorio.findById(dto.casoClinicoId())
                .orElseThrow(() -> new IllegalArgumentException("Caso clínico não encontrado"));

        if (usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR &&
                caso.getProfessorCriador() != null &&
                !caso.getProfessorCriador().getId().equals(usuarioLogado.getId())) {
            throw new IllegalArgumentException("Você só pode vincular casos clínicos criados por você.");
        }

        a.setTurma(turma);
        a.setCasoClinico(caso);
        a.setTitulo(dto.titulo());
        a.setOrientacoesPedagogicas(dto.orientacoesPedagogicas());
        a.setDataInicio(dto.dataInicio());
        a.setDataFim(dto.dataFim());
        a.setTempoLimiteMinutos(dto.tempoLimiteMinutos() != null ? dto.tempoLimiteMinutos() : 20);
        if (dto.ativa() != null) {
            a.setAtiva(dto.ativa());
        }

        AtividadeEducacional salva = atividadeRepositorio.save(a);
        int totalAlunos = (int) turmaAlunoRepositorio.countByTurmaId(turma.getId());
        List<SubmissaoAtividade> subs = submissaoRepositorio.findByAtividadeId(a.getId());
        int totalSubmissoes = (int) subs.stream().filter(s -> s.getStatus() != StatusSubmissao.EM_ANDAMENTO).count();
        int totalAvaliadas = (int) subs.stream().filter(s -> s.getStatus() == StatusSubmissao.AVALIADA).count();
        return AtividadeEducacionalDTO.deEntidade(salva, totalAlunos, totalSubmissoes, totalAvaliadas);
    }

    @Transactional
    public void excluir(Long id, Usuario usuarioLogado) {
        AtividadeEducacional a = atividadeRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Atividade educacional não encontrada"));

        if (usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR &&
                !a.getTurma().getProfessorResponsavel().getId().equals(usuarioLogado.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para excluir esta atividade.");
        }

        atividadeRepositorio.delete(a);
    }
}
