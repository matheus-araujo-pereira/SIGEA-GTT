package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.ItemConsenso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemConsensoRepositorio extends JpaRepository<ItemConsenso, Long> {

    @Query("SELECT i FROM ItemConsenso i JOIN FETCH i.gatilho g JOIN FETCH g.modulo LEFT JOIN FETCH i.categoriaEa WHERE i.consensoDupla.id = :consensoDuplaId")
    List<ItemConsenso> findByConsensoDuplaId(@Param("consensoDuplaId") Long consensoDuplaId);

    void deleteByConsensoDuplaId(Long consensoDuplaId);
}
