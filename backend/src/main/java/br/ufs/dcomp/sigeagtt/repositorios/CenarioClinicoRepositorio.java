package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.CenarioClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CenarioClinicoRepositorio extends JpaRepository<CenarioClinico, Long> {

    @Query("SELECT c FROM CenarioClinico c JOIN FETCH c.professorCriador WHERE c.professorCriador.id = :professorId")
    List<CenarioClinico> findByProfessorCriadorId(@Param("professorId") Long professorId);
}
