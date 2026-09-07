package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.ModuloGtt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModuloGttRepositorio extends JpaRepository<ModuloGtt, Long> {
    Optional<ModuloGtt> findByCodigo(String codigo);
    Optional<ModuloGtt> findByCodigoAndIdNot(String codigo, Long id);
}
