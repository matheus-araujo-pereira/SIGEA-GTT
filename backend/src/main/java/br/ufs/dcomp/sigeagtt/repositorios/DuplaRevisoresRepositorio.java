package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.DuplaRevisores;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DuplaRevisoresRepositorio extends JpaRepository<DuplaRevisores, Long> {
    List<DuplaRevisores> findByAtividadeId(Long atividadeId);
    long countByAtividadeId(Long atividadeId);

    boolean existsByAtividadeIdAndAlunoRevisor1IdAndAlunoRevisor2Id(Long atividadeId, Long aluno1Id, Long aluno2Id);

    @Query("SELECT d FROM DuplaRevisores d WHERE d.atividade.id = :atividadeId AND (d.alunoRevisor1.id = :alunoId OR d.alunoRevisor2.id = :alunoId)")
    Optional<DuplaRevisores> buscarPorAtividadeEAluno(@Param("atividadeId") Long atividadeId, @Param("alunoId") Long alunoId);
}
