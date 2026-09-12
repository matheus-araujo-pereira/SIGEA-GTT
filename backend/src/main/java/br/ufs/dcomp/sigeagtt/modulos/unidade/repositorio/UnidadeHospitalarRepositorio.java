package br.ufs.dcomp.sigeagtt.modulos.unidade.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.unidade.modelo.UnidadeHospitalar;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UnidadeHospitalarRepositorio extends JpaRepository<UnidadeHospitalar, Long> {
    Optional<UnidadeHospitalar> findBySigla(String sigla);

    Optional<UnidadeHospitalar> findBySiglaAndIdNot(String sigla, Long id);

    List<UnidadeHospitalar> findByAtivaTrue();
}
