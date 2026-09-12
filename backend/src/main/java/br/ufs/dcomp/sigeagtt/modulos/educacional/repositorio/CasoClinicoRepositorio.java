package br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.CasoClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CasoClinicoRepositorio extends JpaRepository<CasoClinico, Long> {
    List<CasoClinico> findByProfessorCriadorIdOrderByCriadoEmDesc(Long professorCriadorId);

    List<CasoClinico> findAllByOrderByCriadoEmDesc();
}
