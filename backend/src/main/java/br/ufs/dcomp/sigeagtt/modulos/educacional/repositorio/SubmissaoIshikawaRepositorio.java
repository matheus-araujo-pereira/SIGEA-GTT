package br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.SubmissaoIshikawa;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissaoIshikawaRepositorio extends JpaRepository<SubmissaoIshikawa, Long> {
    Optional<SubmissaoIshikawa> findBySubmissaoId(Long submissaoId);

    void deleteBySubmissaoId(Long submissaoId);
}
