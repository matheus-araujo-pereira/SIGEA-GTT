package br.ufs.dcomp.sigeagtt.modulos.unidade.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.unidade.modelo.UnidadeHospitalar;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UnidadeHospitalarRepositorio extends JpaRepository<UnidadeHospitalar, Long> {
    Optional<UnidadeHospitalar> findBySigla(String sigla);

    Optional<UnidadeHospitalar> findBySiglaAndIdNot(String sigla, Long id);

    List<UnidadeHospitalar> findByAtivaTrue();
}
