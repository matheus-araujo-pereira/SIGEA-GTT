package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.CenarioClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CenarioClinicoRepositorio extends JpaRepository<CenarioClinico, Long> {
    List<CenarioClinico> findByProfessorCriadorId(Long professorId);
}
