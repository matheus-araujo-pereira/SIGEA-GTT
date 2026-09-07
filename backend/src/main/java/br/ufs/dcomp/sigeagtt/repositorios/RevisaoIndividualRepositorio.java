package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.RevisaoIndividual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RevisaoIndividualRepositorio extends JpaRepository<RevisaoIndividual, Long> {
    Optional<RevisaoIndividual> findByDuplaIdAndAlunoIdAndProntuarioId(Long duplaId, Long alunoId, Long prontuarioId);
    List<RevisaoIndividual> findByAlunoId(Long alunoId);
    List<RevisaoIndividual> findByDuplaId(Long duplaId);
}
