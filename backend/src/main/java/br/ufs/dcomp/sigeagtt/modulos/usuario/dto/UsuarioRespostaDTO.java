package br.ufs.dcomp.sigeagtt.modulos.usuario.dto;

import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import java.time.LocalDateTime;

public record UsuarioRespostaDTO(
        Long id,
        String nomeCompleto,
        String email,
        String matriculaSigaa,
        PerfilUsuario perfil,
        Boolean primeiroAcesso,
        Boolean ativo,
        LocalDateTime criadoEm) {
    public static UsuarioRespostaDTO deEntidade(Usuario usuario) {
        return new UsuarioRespostaDTO(
                usuario.getId(),
                usuario.getNomeCompleto(),
                usuario.getEmail(),
                usuario.getMatriculaSigaa(),
                usuario.getPerfil(),
                usuario.getPrimeiroAcesso(),
                usuario.getAtivo(),
                usuario.getCriadoEm());
    }
}
