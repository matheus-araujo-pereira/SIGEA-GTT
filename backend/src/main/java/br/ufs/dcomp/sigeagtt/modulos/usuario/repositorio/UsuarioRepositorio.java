package br.ufs.dcomp.sigeagtt.modulos.usuario.repositorio;

import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByEmailAndIdNot(String email, Long id);

    Optional<Usuario> findByMatriculaSigaa(String matriculaSigaa);

    Optional<Usuario> findByMatriculaSigaaAndIdNot(String matriculaSigaa, Long id);

    long countByPerfilAndAtivoTrue(PerfilUsuario perfil);
}
