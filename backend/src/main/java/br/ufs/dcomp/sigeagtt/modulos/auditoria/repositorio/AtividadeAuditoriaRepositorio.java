package br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.AtividadeAuditoria;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AtividadeAuditoriaRepositorio extends JpaRepository<AtividadeAuditoria, Long> {

    @Query("SELECT a FROM AtividadeAuditoria a JOIN FETCH a.turma JOIN FETCH a.cenario WHERE a.turma.id = :turmaId")
    List<AtividadeAuditoria> findByTurmaId(@Param("turmaId") Long turmaId);

    @Query("SELECT a FROM AtividadeAuditoria a JOIN FETCH a.turma JOIN FETCH a.cenario WHERE a.cenario.id = :cenarioId")
    List<AtividadeAuditoria> findByCenarioId(@Param("cenarioId") Long cenarioId);
}
