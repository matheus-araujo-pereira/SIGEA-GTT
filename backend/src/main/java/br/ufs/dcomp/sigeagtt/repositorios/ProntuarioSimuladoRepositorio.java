package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.ProntuarioSimulado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProntuarioSimuladoRepositorio extends JpaRepository<ProntuarioSimulado, Long> {

    @Query("SELECT p FROM ProntuarioSimulado p JOIN FETCH p.cenario JOIN FETCH p.unidadeHospitalar WHERE p.cenario.id = :cenarioId")
    List<ProntuarioSimulado> findByCenarioId(@Param("cenarioId") Long cenarioId);

    @Query("SELECT p FROM ProntuarioSimulado p JOIN FETCH p.cenario JOIN FETCH p.unidadeHospitalar WHERE p.unidadeHospitalar.id = :unidadeId")
    List<ProntuarioSimulado> findByUnidadeHospitalarId(@Param("unidadeId") Long unidadeId);
}
