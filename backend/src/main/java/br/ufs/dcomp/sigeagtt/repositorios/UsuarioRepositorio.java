package br.ufs.dcomp.sigeagtt.repositorios;

import br.ufs.dcomp.sigeagtt.modelos.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modelos.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCpf(String cpf);
    Optional<Usuario> findByCpfAndIdNot(String cpf, Long id);
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByEmailAndIdNot(String email, Long id);
    Optional<Usuario> findByMatriculaSigaa(String matriculaSigaa);
    Optional<Usuario> findByMatriculaSigaaAndIdNot(String matriculaSigaa, Long id);
    List<Usuario> findByPerfil(PerfilUsuario perfil);
    List<Usuario> findByAtivoTrue();
    long countByPerfilAndAtivoTrue(PerfilUsuario perfil);
}
