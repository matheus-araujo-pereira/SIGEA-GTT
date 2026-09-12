package br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.StatusSubmissao;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.SubmissaoAtividade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SubmissaoAtividadeRepositorio extends JpaRepository<SubmissaoAtividade, Long> {

    Optional<SubmissaoAtividade> findByAtividadeIdAndAlunoId(Long atividadeId, Long alunoId);

    List<SubmissaoAtividade> findByAtividadeId(Long atividadeId);

    List<SubmissaoAtividade> findByAlunoIdOrderByDataInicioDesc(Long alunoId);

    @Query("SELECT s FROM SubmissaoAtividade s WHERE s.atividade.turma.professorResponsavel.id = :professorId AND s.status = :status ORDER BY s.dataSubmissao ASC")
    List<SubmissaoAtividade> findByProfessorAndStatus(@Param("professorId") Long professorId,
            @Param("status") StatusSubmissao status);

    @Query("SELECT s FROM SubmissaoAtividade s WHERE s.atividade.turma.professorResponsavel.id = :professorId ORDER BY s.dataSubmissao DESC")
    List<SubmissaoAtividade> findByProfessor(@Param("professorId") Long professorId);

    @Query("SELECT s FROM SubmissaoAtividade s WHERE s.status = 'AVALIADA'")
    List<SubmissaoAtividade> findTodasAvaliadas();
}
