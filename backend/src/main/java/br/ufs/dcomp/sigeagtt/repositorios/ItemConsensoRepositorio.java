package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.ItemConsenso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemConsensoRepositorio extends JpaRepository<ItemConsenso, Long> {
    List<ItemConsenso> findByConsensoDuplaId(Long consensoDuplaId);
    void deleteByConsensoDuplaId(Long consensoDuplaId);
}
