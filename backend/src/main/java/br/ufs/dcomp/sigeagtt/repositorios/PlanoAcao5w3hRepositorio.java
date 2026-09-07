package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.PlanoAcao5w3h;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanoAcao5w3hRepositorio extends JpaRepository<PlanoAcao5w3h, Long> {
    List<PlanoAcao5w3h> findByConsensoDuplaId(Long consensoDuplaId);
    void deleteByConsensoDuplaId(Long consensoDuplaId);
}
