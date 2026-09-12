package br.ufs.dcomp.sigeagtt.modulos.turma.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.turma.modelo.Turma;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TurmaRepositorio extends JpaRepository<Turma, Long> {

    @Query("SELECT t FROM Turma t JOIN FETCH t.professorResponsavel WHERE t.professorResponsavel.id = :professorId")
    List<Turma> findByProfessorResponsavelId(@Param("professorId") Long professorId);

    @Query("SELECT t FROM Turma t JOIN FETCH t.professorResponsavel WHERE t.ativa = true")
    List<Turma> findByAtivaTrue();
}
