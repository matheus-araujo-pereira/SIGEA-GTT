package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.*;
import br.ufs.dcomp.sigeagtt.repositorios.*;
import br.ufs.dcomp.sigeagtt.transferencia.DuplaRevisoresRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.DuplaRevisoresRespostaDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DuplaRevisoresServico {

    private final DuplaRevisoresRepositorio duplaRepositorio;
    private final AtividadeAuditoriaRepositorio atividadeRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final TurmaAlunoRepositorio turmaAlunoRepositorio;

    public DuplaRevisoresServico(DuplaRevisoresRepositorio duplaRepositorio,
                                 AtividadeAuditoriaRepositorio atividadeRepositorio,
                                 UsuarioRepositorio usuarioRepositorio,
                                 TurmaAlunoRepositorio turmaAlunoRepositorio) {
        this.duplaRepositorio = duplaRepositorio;
        this.atividadeRepositorio = atividadeRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.turmaAlunoRepositorio = turmaAlunoRepositorio;
    }

    @Transactional(readOnly = true)
    public List<DuplaRevisoresRespostaDTO> listarPorAtividade(Long atividadeId) {
        return duplaRepositorio.findByAtividadeId(atividadeId).stream()
                .map(DuplaRevisoresRespostaDTO::deEntidade)
                .toList();
    }

    @Transactional
    public DuplaRevisoresRespostaDTO cadastrar(DuplaRevisoresRequisicaoDTO dto) {
        if (dto.alunoRevisor1Id().equals(dto.alunoRevisor2Id())) {
            throw new IllegalArgumentException("A metodologia do IHI exige dois revisores primários distintos para a auditoria.");
        }

        AtividadeAuditoria atividade = atividadeRepositorio.findById(dto.atividadeId())
                .orElseThrow(() -> new IllegalArgumentException("Atividade de auditoria não encontrada: " + dto.atividadeId()));

        Usuario aluno1 = usuarioRepositorio.findById(dto.alunoRevisor1Id())
                .orElseThrow(() -> new IllegalArgumentException("Aluno Revisor 1 não encontrado: " + dto.alunoRevisor1Id()));

        Usuario aluno2 = usuarioRepositorio.findById(dto.alunoRevisor2Id())
                .orElseThrow(() -> new IllegalArgumentException("Aluno Revisor 2 não encontrado: " + dto.alunoRevisor2Id()));

        if (aluno1.getPerfil() != PerfilUsuario.ALUNO || aluno2.getPerfil() != PerfilUsuario.ALUNO) {
            throw new IllegalArgumentException("Ambos os membros da dupla de revisão devem possuir perfil de ALUNO.");
        }

        Long turmaId = atividade.getTurma().getId();
        if (!turmaAlunoRepositorio.existsByTurmaIdAndAlunoId(turmaId, aluno1.getId())) {
            throw new IllegalArgumentException("O discente " + aluno1.getNomeCompleto() + " não está matriculado na turma desta atividade.");
        }
        if (!turmaAlunoRepositorio.existsByTurmaIdAndAlunoId(turmaId, aluno2.getId())) {
            throw new IllegalArgumentException("O discente " + aluno2.getNomeCompleto() + " não está matriculado na turma desta atividade.");
        }

        if (duplaRepositorio.existsByAtividadeIdAndAlunoRevisor1IdAndAlunoRevisor2Id(atividade.getId(), aluno1.getId(), aluno2.getId())) {
            throw new IllegalArgumentException("Esta dupla já está cadastrada nesta atividade de auditoria.");
        }

        DuplaRevisores dupla = new DuplaRevisores();
        dupla.setAtividade(atividade);
        dupla.setAlunoRevisor1(aluno1);
        dupla.setAlunoRevisor2(aluno2);
        dupla.setAtiva(true);

        return DuplaRevisoresRespostaDTO.deEntidade(duplaRepositorio.save(dupla));
    }

    @Transactional
    public void excluir(Long id) {
        DuplaRevisores dupla = duplaRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dupla de revisores não encontrada: " + id));
        duplaRepositorio.delete(dupla);
    }

    @Transactional
    public DuplaRevisoresRespostaDTO alternarStatus(Long id) {
        DuplaRevisores dupla = duplaRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dupla não encontrada: " + id));
        dupla.setAtiva(!Boolean.TRUE.equals(dupla.getAtiva()));
        return DuplaRevisoresRespostaDTO.deEntidade(duplaRepositorio.save(dupla));
    }
}
