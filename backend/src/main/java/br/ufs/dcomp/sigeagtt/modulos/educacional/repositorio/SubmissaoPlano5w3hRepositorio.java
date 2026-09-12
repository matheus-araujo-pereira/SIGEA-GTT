package br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.SubmissaoPlano5w3h;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissaoPlano5w3hRepositorio extends JpaRepository<SubmissaoPlano5w3h, Long> {
    List<SubmissaoPlano5w3h> findBySubmissaoId(Long submissaoId);

    void deleteBySubmissaoId(Long submissaoId);
}
