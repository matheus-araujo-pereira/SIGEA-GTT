package br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.CategoriaEventoAdverso;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoriaEventoAdversoRepositorio extends JpaRepository<CategoriaEventoAdverso, Long> {
    List<CategoriaEventoAdverso> findByAtivaTrue();
}
