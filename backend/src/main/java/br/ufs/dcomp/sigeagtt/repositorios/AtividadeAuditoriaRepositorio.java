package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.AtividadeAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AtividadeAuditoriaRepositorio extends JpaRepository<AtividadeAuditoria, Long> {
    List<AtividadeAuditoria> findByTurmaId(Long turmaId);
    List<AtividadeAuditoria> findByCenarioId(Long cenarioId);
}
