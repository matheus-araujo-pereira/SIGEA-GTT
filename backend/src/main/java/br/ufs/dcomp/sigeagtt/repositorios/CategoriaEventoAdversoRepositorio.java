package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.CategoriaEventoAdverso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaEventoAdversoRepositorio extends JpaRepository<CategoriaEventoAdverso, Long> {
    List<CategoriaEventoAdverso> findByAtivaTrue();
}
