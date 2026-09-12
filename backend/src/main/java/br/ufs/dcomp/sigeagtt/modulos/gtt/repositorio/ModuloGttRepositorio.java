package br.ufs.dcomp.sigeagtt.modulos.gtt.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.gtt.modelo.ModuloGtt;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ModuloGttRepositorio extends JpaRepository<ModuloGtt, Long> {
    Optional<ModuloGtt> findByCodigo(String codigo);

    Optional<ModuloGtt> findByCodigoAndIdNot(String codigo, Long id);
}
