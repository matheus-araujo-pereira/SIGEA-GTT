package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.CategoriaEventoAdverso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoriaEventoAdversoRepositorio extends JpaRepository<CategoriaEventoAdverso, Long> {
    List<CategoriaEventoAdverso> findByAtivaTrue();
}
