package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.UnidadeHospitalar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnidadeHospitalarRepositorio extends JpaRepository<UnidadeHospitalar, Long> {
    List<UnidadeHospitalar> findByAtivaTrue();
}
