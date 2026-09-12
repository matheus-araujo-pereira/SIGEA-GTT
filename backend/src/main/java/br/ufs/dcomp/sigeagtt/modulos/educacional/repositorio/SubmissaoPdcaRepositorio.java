package br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.SubmissaoPdca;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissaoPdcaRepositorio extends JpaRepository<SubmissaoPdca, Long> {
    Optional<SubmissaoPdca> findBySubmissaoId(Long submissaoId);

    void deleteBySubmissaoId(Long submissaoId);
}
