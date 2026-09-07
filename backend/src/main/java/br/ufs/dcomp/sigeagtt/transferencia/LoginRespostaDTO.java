package br.ufs.dcomp.sigeagtt.transferencia;

import br.ufs.dcomp.sigeagtt.modelos.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modelos.Usuario;

public record LoginRespostaDTO(
    Long id,
    String nomeCompleto,
    String email,
    String matriculaSigaa,
    PerfilUsuario perfil,
    Boolean primeiroAcesso,
    Boolean ativo
) {
    public static LoginRespostaDTO deEntidade(Usuario usuario) {
        return new LoginRespostaDTO(
            usuario.getId(),
            usuario.getNomeCompleto(),
            usuario.getEmail(),
            usuario.getMatriculaSigaa(),
            usuario.getPerfil(),
            usuario.getPrimeiroAcesso(),
            usuario.getAtivo()
        );
    }
}
