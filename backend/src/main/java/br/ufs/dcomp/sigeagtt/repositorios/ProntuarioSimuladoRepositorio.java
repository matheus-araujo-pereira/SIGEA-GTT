package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.ProntuarioSimulado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProntuarioSimuladoRepositorio extends JpaRepository<ProntuarioSimulado, Long> {
    List<ProntuarioSimulado> findByCenarioId(Long cenarioId);
    List<ProntuarioSimulado> findByUnidadeHospitalarId(Long unidadeId);
}
