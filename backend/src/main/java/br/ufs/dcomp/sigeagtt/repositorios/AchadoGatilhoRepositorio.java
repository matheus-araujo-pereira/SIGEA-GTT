package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.AchadoGatilho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AchadoGatilhoRepositorio extends JpaRepository<AchadoGatilho, Long> {

    @Query("SELECT a FROM AchadoGatilho a JOIN FETCH a.gatilho g JOIN FETCH g.modulo LEFT JOIN FETCH a.categoriaEa WHERE a.revisaoIndividual.id = :revisaoIndividualId")
    List<AchadoGatilho> findByRevisaoIndividualId(@Param("revisaoIndividualId") Long revisaoIndividualId);

    void deleteByRevisaoIndividualId(Long revisaoIndividualId);
}
