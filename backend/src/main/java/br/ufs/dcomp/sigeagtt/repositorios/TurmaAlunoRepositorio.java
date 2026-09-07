package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.TurmaAluno;
import br.ufs.dcomp.sigeagtt.modelos.TurmaAlunoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TurmaAlunoRepositorio extends JpaRepository<TurmaAluno, TurmaAlunoId> {

    @Query("SELECT ta FROM TurmaAluno ta JOIN FETCH ta.aluno WHERE ta.turma.id = :turmaId")
    List<TurmaAluno> findByTurmaId(@Param("turmaId") Long turmaId);

    boolean existsByTurmaIdAndAlunoId(Long turmaId, Long alunoId);

    void deleteByTurmaIdAndAlunoId(Long turmaId, Long alunoId);

    long countByTurmaId(Long turmaId);
}
