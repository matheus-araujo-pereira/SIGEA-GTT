package br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.SubmissaoPdca;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SubmissaoPdcaRepositorio extends JpaRepository<SubmissaoPdca, Long> {
    Optional<SubmissaoPdca> findBySubmissaoId(Long submissaoId);

    void deleteBySubmissaoId(Long submissaoId);
}
