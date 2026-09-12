package br.ufs.dcomp.sigeagtt.modulos.turma.servico;

import br.ufs.dcomp.sigeagtt.modulos.turma.dto.TurmaRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.turma.dto.TurmaRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.turma.modelo.Turma;
import br.ufs.dcomp.sigeagtt.modulos.turma.modelo.TurmaAluno;
import br.ufs.dcomp.sigeagtt.modulos.turma.repositorio.TurmaAlunoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.turma.repositorio.TurmaRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.usuario.dto.UsuarioRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.repositorio.UsuarioRepositorio;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TurmaServico {

    private final TurmaRepositorio turmaRepositorio;
    private final TurmaAlunoRepositorio turmaAlunoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;

    public TurmaServico(
            TurmaRepositorio turmaRepositorio,
            TurmaAlunoRepositorio turmaAlunoRepositorio,
            UsuarioRepositorio usuarioRepositorio) {
        this.turmaRepositorio = turmaRepositorio;
        this.turmaAlunoRepositorio = turmaAlunoRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
    }

    @Transactional(readOnly = true)
    public List<TurmaRespostaDTO> listar(Long professorId) {
        List<Turma> turmas =
                (professorId != null)
                        ? turmaRepositorio.findByProfessorResponsavelId(professorId)
                        : turmaRepositorio.findAll();

        return turmas.stream()
                .map(
                        t -> {
                            long total = turmaAlunoRepositorio.countByTurmaId(t.getId());
                            return TurmaRespostaDTO.deEntidade(t, total);
                        })
                .toList();
    }

    @Transactional(readOnly = true)
    public TurmaRespostaDTO buscarPorId(Long id) {
        Turma turma =
                turmaRepositorio
                        .findById(id)
                        .orElseThrow(
                                () -> new NoSuchElementException("Turma não encontrada: " + id));
        long total = turmaAlunoRepositorio.countByTurmaId(turma.getId());
        return TurmaRespostaDTO.deEntidade(turma, total);
    }

    @Transactional
    public TurmaRespostaDTO cadastrar(TurmaRequisicaoDTO dto) {
        Usuario professor =
                usuarioRepositorio
                        .findById(dto.professorResponsavelId())
                        .orElseThrow(
                                () ->
                                        new NoSuchElementException(
                                                "Professor responsável não encontrado: "
                                                        + dto.professorResponsavelId()));

        if (professor.getPerfil() != PerfilUsuario.PROFESSOR) {
            throw new IllegalArgumentException(
                    "Apenas usuários com perfil de PROFESSOR podem ser responsáveis por turmas.");
        }

        String cod =
                dto.codigoDisciplina() != null ? dto.codigoDisciplina().trim().toUpperCase() : "";
        String periodo = dto.periodoLetivo() != null ? dto.periodoLetivo().trim() : "";
        String anoSemestre = dto.anoSemestre() != null ? dto.anoSemestre().trim() : "";

        Turma turma = new Turma();
        turma.setCodigoDisciplina(cod);
        turma.setPeriodoLetivo(periodo);
        turma.setAnoSemestre(anoSemestre);
        turma.setProfessorResponsavel(professor);
        turma.setAtiva(true);

        return TurmaRespostaDTO.deEntidade(turmaRepositorio.save(turma), 0);
    }

    @Transactional
    public TurmaRespostaDTO editar(Long id, TurmaRequisicaoDTO dto) {
        Turma turma =
                turmaRepositorio
                        .findById(id)
                        .orElseThrow(
                                () -> new NoSuchElementException("Turma não encontrada: " + id));

        Usuario professor =
                usuarioRepositorio
                        .findById(dto.professorResponsavelId())
                        .orElseThrow(
                                () ->
                                        new NoSuchElementException(
                                                "Professor responsável não encontrado: "
                                                        + dto.professorResponsavelId()));

        if (professor.getPerfil() != PerfilUsuario.PROFESSOR) {
            throw new IllegalArgumentException(
                    "Apenas usuários com perfil de PROFESSOR podem ser responsáveis por turmas.");
        }

        String cod =
                dto.codigoDisciplina() != null ? dto.codigoDisciplina().trim().toUpperCase() : "";
        String periodo = dto.periodoLetivo() != null ? dto.periodoLetivo().trim() : "";
        String anoSemestre = dto.anoSemestre() != null ? dto.anoSemestre().trim() : "";

        turma.setCodigoDisciplina(cod);
        turma.setPeriodoLetivo(periodo);
        turma.setAnoSemestre(anoSemestre);
        turma.setProfessorResponsavel(professor);

        long total = turmaAlunoRepositorio.countByTurmaId(turma.getId());
        return TurmaRespostaDTO.deEntidade(turmaRepositorio.save(turma), total);
    }

    @Transactional
    public void excluir(Long id) {
        Turma turma =
                turmaRepositorio
                        .findById(id)
                        .orElseThrow(
                                () -> new NoSuchElementException("Turma não encontrada: " + id));
        turmaRepositorio.delete(turma);
    }

    @Transactional
    public TurmaRespostaDTO alternarStatus(Long id) {
        Turma turma =
                turmaRepositorio
                        .findById(id)
                        .orElseThrow(
                                () -> new NoSuchElementException("Turma não encontrada: " + id));
        turma.setAtiva(!Boolean.TRUE.equals(turma.getAtiva()));
        long total = turmaAlunoRepositorio.countByTurmaId(turma.getId());
        return TurmaRespostaDTO.deEntidade(turmaRepositorio.save(turma), total);
    }

    @Transactional(readOnly = true)
    public List<UsuarioRespostaDTO> listarAlunosDaTurma(Long turmaId) {
        return turmaAlunoRepositorio.findByTurmaId(turmaId).stream()
                .map(ta -> UsuarioRespostaDTO.deEntidade(ta.getAluno()))
                .toList();
    }

    @Transactional
    public void matricularAluno(Long turmaId, Long alunoId) {
        Turma turma =
                turmaRepositorio
                        .findById(turmaId)
                        .orElseThrow(
                                () ->
                                        new NoSuchElementException(
                                                "Turma não encontrada: " + turmaId));

        Usuario aluno =
                usuarioRepositorio
                        .findById(alunoId)
                        .orElseThrow(
                                () ->
                                        new NoSuchElementException(
                                                "Aluno não encontrado: " + alunoId));

        if (aluno.getPerfil() != PerfilUsuario.ALUNO) {
            throw new IllegalArgumentException(
                    "Apenas usuários com perfil de ALUNO podem ser matriculados em turmas.");
        }

        if (turmaAlunoRepositorio.existsByTurmaIdAndAlunoId(turmaId, alunoId)) {
            throw new IllegalArgumentException(
                    "O aluno " + aluno.getNomeCompleto() + " já está matriculado nesta turma.");
        }

        TurmaAluno vinculo = new TurmaAluno(turma, aluno);
        turmaAlunoRepositorio.save(vinculo);
    }

    @Transactional
    public void desmatricularAluno(Long turmaId, Long alunoId) {
        if (!turmaAlunoRepositorio.existsByTurmaIdAndAlunoId(turmaId, alunoId)) {
            throw new IllegalArgumentException(
                    "O aluno informado não está vinculado a esta turma.");
        }
        turmaAlunoRepositorio.deleteByTurmaIdAndAlunoId(turmaId, alunoId);
    }
}
