package br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.AtividadeEducacional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AtividadeEducacionalRepositorio extends JpaRepository<AtividadeEducacional, Long> {

    List<AtividadeEducacional> findByTurmaIdOrderByCriadaEmDesc(Long turmaId);

    @Query("SELECT a FROM AtividadeEducacional a WHERE a.turma.professorResponsavel.id = :professorId ORDER BY a.criadaEm DESC")
    List<AtividadeEducacional> findByProfessorId(@Param("professorId") Long professorId);

    @Query("SELECT a FROM AtividadeEducacional a WHERE a.turma.id IN (SELECT ta.turma.id FROM br.ufs.dcomp.sigeagtt.modulos.turma.modelo.TurmaAluno ta WHERE ta.aluno.id = :alunoId) AND a.ativa = true ORDER BY a.dataFim ASC")
    List<AtividadeEducacional> findAtividadesParaAluno(@Param("alunoId") Long alunoId);

    List<AtividadeEducacional> findAllByOrderByCriadaEmDesc();
}
