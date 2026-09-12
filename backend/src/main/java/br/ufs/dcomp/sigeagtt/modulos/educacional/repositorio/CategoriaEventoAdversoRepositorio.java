package br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.CategoriaEventoAdverso;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaEventoAdversoRepositorio
        extends JpaRepository<CategoriaEventoAdverso, Long> {
    List<CategoriaEventoAdverso> findByAtivaTrue();
}
