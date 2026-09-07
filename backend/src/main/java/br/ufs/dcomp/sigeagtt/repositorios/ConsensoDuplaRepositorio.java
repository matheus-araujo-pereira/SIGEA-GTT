package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.ConsensoDupla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsensoDuplaRepositorio extends JpaRepository<ConsensoDupla, Long> {
    Optional<ConsensoDupla> findByDuplaIdAndProntuarioId(Long duplaId, Long prontuarioId);
    List<ConsensoDupla> findByDuplaId(Long duplaId);
}
