package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.GatilhoGtt;
import br.ufs.dcomp.sigeagtt.modelos.ModuloGtt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GatilhoGttRepositorio extends JpaRepository<GatilhoGtt, Long> {
    Optional<GatilhoGtt> findByCodigo(String codigo);
    List<GatilhoGtt> findByModulo(ModuloGtt modulo);
    List<GatilhoGtt> findByAtivoTrue();
}
