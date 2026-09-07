package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.ConsensoDupla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ConsensoDuplaRepositorio extends JpaRepository<ConsensoDupla, Long> {

    @Query("SELECT c FROM ConsensoDupla c JOIN FETCH c.dupla d JOIN FETCH d.alunoRevisor1 JOIN FETCH d.alunoRevisor2 JOIN FETCH c.prontuario WHERE c.dupla.id = :duplaId AND c.prontuario.id = :prontuarioId")
    Optional<ConsensoDupla> findByDuplaIdAndProntuarioId(@Param("duplaId") Long duplaId,
            @Param("prontuarioId") Long prontuarioId);

    @Query("SELECT c FROM ConsensoDupla c JOIN FETCH c.dupla d JOIN FETCH c.prontuario WHERE c.dupla.id = :duplaId")
    List<ConsensoDupla> findByDuplaId(@Param("duplaId") Long duplaId);
}
