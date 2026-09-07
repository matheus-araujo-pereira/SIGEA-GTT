package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.TurmaAluno;
import br.ufs.dcomp.sigeagtt.modelos.TurmaAlunoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TurmaAlunoRepositorio extends JpaRepository<TurmaAluno, TurmaAlunoId> {
    List<TurmaAluno> findByTurmaId(Long turmaId);
    boolean existsByTurmaIdAndAlunoId(Long turmaId, Long alunoId);
    void deleteByTurmaIdAndAlunoId(Long turmaId, Long alunoId);
    long countByTurmaId(Long turmaId);
}
