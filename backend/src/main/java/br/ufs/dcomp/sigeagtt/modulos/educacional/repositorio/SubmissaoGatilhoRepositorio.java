package br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.SubmissaoGatilho;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissaoGatilhoRepositorio extends JpaRepository<SubmissaoGatilho, Long> {
    List<SubmissaoGatilho> findBySubmissaoId(Long submissaoId);

    void deleteBySubmissaoId(Long submissaoId);
}
