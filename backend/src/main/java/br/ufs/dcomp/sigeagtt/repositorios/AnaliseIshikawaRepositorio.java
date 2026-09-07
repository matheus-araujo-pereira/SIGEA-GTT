package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.AnaliseIshikawa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnaliseIshikawaRepositorio extends JpaRepository<AnaliseIshikawa, Long> {
    Optional<AnaliseIshikawa> findByConsensoDuplaId(Long consensoDuplaId);
}
