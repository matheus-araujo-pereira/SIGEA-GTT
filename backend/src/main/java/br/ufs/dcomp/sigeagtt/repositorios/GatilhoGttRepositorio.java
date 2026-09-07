package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.GatilhoGtt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface GatilhoGttRepositorio extends JpaRepository<GatilhoGtt, Long> {
    Optional<GatilhoGtt> findByCodigo(String codigo);

    Optional<GatilhoGtt> findByCodigoAndIdNot(String codigo, Long id);

    @Query("SELECT g FROM GatilhoGtt g JOIN FETCH g.modulo WHERE g.modulo.id = :moduloId")
    List<GatilhoGtt> findByModuloId(@Param("moduloId") Long moduloId);

    @Query("SELECT g FROM GatilhoGtt g JOIN FETCH g.modulo WHERE g.ativo = true ORDER BY g.codigo ASC")
    List<GatilhoGtt> findByAtivoTrue();
}
