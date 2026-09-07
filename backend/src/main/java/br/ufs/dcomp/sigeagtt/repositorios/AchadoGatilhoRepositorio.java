package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.AchadoGatilho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchadoGatilhoRepositorio extends JpaRepository<AchadoGatilho, Long> {
    List<AchadoGatilho> findByRevisaoIndividualId(Long revisaoIndividualId);
    void deleteByRevisaoIndividualId(Long revisaoIndividualId);
}
