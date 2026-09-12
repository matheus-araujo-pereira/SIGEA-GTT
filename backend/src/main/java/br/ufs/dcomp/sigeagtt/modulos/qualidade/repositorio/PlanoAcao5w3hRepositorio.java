package br.ufs.dcomp.sigeagtt.modulos.qualidade.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.qualidade.modelo.PlanoAcao5w3h;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlanoAcao5w3hRepositorio extends JpaRepository<PlanoAcao5w3h, Long> {
    List<PlanoAcao5w3h> findByRevisaoIndividualId(Long revisaoIndividualId);

    void deleteByRevisaoIndividualId(Long revisaoIndividualId);
}
