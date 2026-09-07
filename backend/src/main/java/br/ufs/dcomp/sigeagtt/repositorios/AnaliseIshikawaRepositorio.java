package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.AnaliseIshikawa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AnaliseIshikawaRepositorio extends JpaRepository<AnaliseIshikawa, Long> {
    Optional<AnaliseIshikawa> findByConsensoDuplaId(Long consensoDuplaId);
}
