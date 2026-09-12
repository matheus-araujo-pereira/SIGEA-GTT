package br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.SubmissaoPlano5w3h;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissaoPlano5w3hRepositorio extends JpaRepository<SubmissaoPlano5w3h, Long> {
    List<SubmissaoPlano5w3h> findBySubmissaoId(Long submissaoId);

    void deleteBySubmissaoId(Long submissaoId);
}
