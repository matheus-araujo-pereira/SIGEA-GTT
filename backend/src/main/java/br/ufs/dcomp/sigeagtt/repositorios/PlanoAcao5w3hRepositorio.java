package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.PlanoAcao5w3h;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlanoAcao5w3hRepositorio extends JpaRepository<PlanoAcao5w3h, Long> {
    List<PlanoAcao5w3h> findByConsensoDuplaId(Long consensoDuplaId);

    void deleteByConsensoDuplaId(Long consensoDuplaId);

    List<PlanoAcao5w3h> findByRevisaoIndividualId(Long revisaoIndividualId);

    void deleteByRevisaoIndividualId(Long revisaoIndividualId);
}
