package br.ufs.dcomp.sigeagtt.modulos.qualidade.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.qualidade.modelo.AnaliseIshikawa;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AnaliseIshikawaRepositorio extends JpaRepository<AnaliseIshikawa, Long> {
    Optional<AnaliseIshikawa> findByRevisaoIndividualId(Long revisaoIndividualId);
}
