package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.RevisaoIndividual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RevisaoIndividualRepositorio extends JpaRepository<RevisaoIndividual, Long> {

    @Query("SELECT r FROM RevisaoIndividual r JOIN FETCH r.dupla d JOIN FETCH d.alunoRevisor1 JOIN FETCH d.alunoRevisor2 JOIN FETCH r.aluno JOIN FETCH r.prontuario WHERE r.dupla.id = :duplaId AND r.aluno.id = :alunoId AND r.prontuario.id = :prontuarioId")
    Optional<RevisaoIndividual> findByDuplaIdAndAlunoIdAndProntuarioId(@Param("duplaId") Long duplaId, @Param("alunoId") Long alunoId, @Param("prontuarioId") Long prontuarioId);

    @Query("SELECT r FROM RevisaoIndividual r JOIN FETCH r.dupla d JOIN FETCH r.aluno JOIN FETCH r.prontuario WHERE r.aluno.id = :alunoId")
    List<RevisaoIndividual> findByAlunoId(@Param("alunoId") Long alunoId);

    @Query("SELECT r FROM RevisaoIndividual r JOIN FETCH r.dupla d JOIN FETCH r.aluno JOIN FETCH r.prontuario WHERE r.dupla.id = :duplaId")
    List<RevisaoIndividual> findByDuplaId(@Param("duplaId") Long duplaId);
}
