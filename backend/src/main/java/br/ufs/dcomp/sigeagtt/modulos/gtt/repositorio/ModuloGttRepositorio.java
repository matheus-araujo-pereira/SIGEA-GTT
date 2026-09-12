package br.ufs.dcomp.sigeagtt.modulos.gtt.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.gtt.modelo.ModuloGtt;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModuloGttRepositorio extends JpaRepository<ModuloGtt, Long> {
    Optional<ModuloGtt> findByCodigo(String codigo);

    Optional<ModuloGtt> findByCodigoAndIdNot(String codigo, Long id);
}
