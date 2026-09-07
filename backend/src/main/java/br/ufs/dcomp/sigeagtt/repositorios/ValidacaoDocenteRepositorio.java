package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.ValidacaoDocente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ValidacaoDocenteRepositorio extends JpaRepository<ValidacaoDocente, Long> {

    @Query("SELECT v FROM ValidacaoDocente v JOIN FETCH v.professorValidador WHERE v.consensoDupla.id = :consensoDuplaId")
    Optional<ValidacaoDocente> findByConsensoDuplaId(@Param("consensoDuplaId") Long consensoDuplaId);
}
