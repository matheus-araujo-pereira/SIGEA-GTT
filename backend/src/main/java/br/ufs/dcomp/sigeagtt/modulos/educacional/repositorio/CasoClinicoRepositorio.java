package br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.CasoClinico;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CasoClinicoRepositorio extends JpaRepository<CasoClinico, Long> {
    List<CasoClinico> findByProfessorCriadorIdOrderByCriadoEmDesc(Long professorCriadorId);

    List<CasoClinico> findAllByOrderByCriadoEmDesc();
}
