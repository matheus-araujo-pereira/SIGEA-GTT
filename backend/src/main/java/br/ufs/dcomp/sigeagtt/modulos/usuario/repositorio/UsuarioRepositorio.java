package br.ufs.dcomp.sigeagtt.modulos.usuario.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByEmailAndIdNot(String email, Long id);

    Optional<Usuario> findByMatriculaSigaa(String matriculaSigaa);

    Optional<Usuario> findByMatriculaSigaaAndIdNot(String matriculaSigaa, Long id);

    long countByPerfilAndAtivoTrue(PerfilUsuario perfil);
}
