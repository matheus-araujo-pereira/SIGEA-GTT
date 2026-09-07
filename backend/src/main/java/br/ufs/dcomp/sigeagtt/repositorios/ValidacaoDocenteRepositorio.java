package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.ValidacaoDocente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ValidacaoDocenteRepositorio extends JpaRepository<ValidacaoDocente, Long> {
    Optional<ValidacaoDocente> findByConsensoDuplaId(Long consensoDuplaId);
}
