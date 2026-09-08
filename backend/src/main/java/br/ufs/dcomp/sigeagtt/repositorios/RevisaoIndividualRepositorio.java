package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.RevisaoIndividual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface RevisaoIndividualRepositorio extends JpaRepository<RevisaoIndividual, Long> {

    @Query("SELECT r FROM RevisaoIndividual r JOIN FETCH r.aluno JOIN FETCH r.prontuario WHERE r.atividade.id = :atividadeId AND r.aluno.id = :alunoId AND r.prontuario.id = :prontuarioId")
    Optional<RevisaoIndividual> findByAtividadeIdAndAlunoIdAndProntuarioId(@Param("atividadeId") Long atividadeId,
            @Param("alunoId") Long alunoId, @Param("prontuarioId") Long prontuarioId);

    @Query("SELECT r FROM RevisaoIndividual r JOIN FETCH r.aluno JOIN FETCH r.prontuario WHERE r.atividade.id = :atividadeId AND r.aluno.id = :alunoId")
    List<RevisaoIndividual> findByAtividadeIdAndAlunoId(@Param("atividadeId") Long atividadeId,
            @Param("alunoId") Long alunoId);

    long countByAtividadeId(Long atividadeId);

    @Query("SELECT r FROM RevisaoIndividual r JOIN FETCH r.aluno JOIN FETCH r.prontuario WHERE r.aluno.id = :alunoId")
    List<RevisaoIndividual> findByAlunoId(@Param("alunoId") Long alunoId);
}
