package br.ufs.dcomp.sigeagtt.modulos.qualidade.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.qualidade.modelo.CicloPdca;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CicloPdcaRepositorio extends JpaRepository<CicloPdca, Long> {
    Optional<CicloPdca> findByRevisaoIndividualId(Long revisaoIndividualId);
}
