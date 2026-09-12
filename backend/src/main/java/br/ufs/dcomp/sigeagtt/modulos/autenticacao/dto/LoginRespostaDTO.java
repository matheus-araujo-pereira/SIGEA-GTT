package br.ufs.dcomp.sigeagtt.modulos.autenticacao.dto;

import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;

public record LoginRespostaDTO(
        Long id,
        String nomeCompleto,
        String email,
        String matriculaSigaa,
        PerfilUsuario perfil,
        Boolean primeiroAcesso,
        Boolean ativo,
        String token) {
    public static LoginRespostaDTO deEntidade(Usuario usuario) {
        return deEntidade(usuario, null);
    }

    public static LoginRespostaDTO deEntidade(Usuario usuario, String token) {
        return new LoginRespostaDTO(
                usuario.getId(),
                usuario.getNomeCompleto(),
                usuario.getEmail(),
                usuario.getMatriculaSigaa(),
                usuario.getPerfil(),
                usuario.getPrimeiroAcesso(),
                usuario.getAtivo(),
                token);
    }
}
