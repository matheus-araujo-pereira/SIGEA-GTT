package br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.SubmissaoIshikawa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SubmissaoIshikawaRepositorio extends JpaRepository<SubmissaoIshikawa, Long> {
    Optional<SubmissaoIshikawa> findBySubmissaoId(Long submissaoId);

    void deleteBySubmissaoId(Long submissaoId);
}
