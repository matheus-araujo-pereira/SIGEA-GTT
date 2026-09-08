package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.ValidacaoDocente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ValidacaoDocenteRepositorio extends JpaRepository<ValidacaoDocente, Long> {

    @Query("SELECT v FROM ValidacaoDocente v JOIN FETCH v.professorValidador WHERE v.consensoDupla.id = :consensoDuplaId")
    Optional<ValidacaoDocente> findByConsensoDuplaId(@Param("consensoDuplaId") Long consensoDuplaId);

    @Query("SELECT v FROM ValidacaoDocente v JOIN FETCH v.professorValidador WHERE v.revisaoIndividual.id = :revisaoId")
    Optional<ValidacaoDocente> findByRevisaoIndividualId(@Param("revisaoId") Long revisaoId);
}
