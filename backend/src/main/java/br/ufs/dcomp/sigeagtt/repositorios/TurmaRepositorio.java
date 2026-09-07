package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TurmaRepositorio extends JpaRepository<Turma, Long> {
    List<Turma> findByProfessorResponsavelId(Long professorId);
    List<Turma> findByAtivaTrue();
}
