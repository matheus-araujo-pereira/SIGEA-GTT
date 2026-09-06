package br.ufs.dcomp.sigeagtt.transferencia;

import br.ufs.dcomp.sigeagtt.modelos.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modelos.Usuario;

public record LoginRespostaDTO(
    Long id,
    String nomeCompleto,
    String cpf,
    String email,
    String cargo,
    String matriculaSigaa,
    PerfilUsuario perfil,
    Boolean primeiroAcesso
) {
    public static LoginRespostaDTO deEntidade(Usuario usuario) {
        return new LoginRespostaDTO(
            usuario.getId(),
            usuario.getNomeCompleto(),
            usuario.getCpf(),
            usuario.getEmail(),
            usuario.getCargo(),
            usuario.getMatriculaSigaa(),
            usuario.getPerfil(),
            usuario.getPrimeiroAcesso()
        );
    }
}
