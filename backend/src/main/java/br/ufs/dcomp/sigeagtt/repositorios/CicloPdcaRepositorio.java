package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.CicloPdca;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CicloPdcaRepositorio extends JpaRepository<CicloPdca, Long> {
    Optional<CicloPdca> findByConsensoDuplaId(Long consensoDuplaId);

    Optional<CicloPdca> findByRevisaoIndividualId(Long revisaoIndividualId);
}
