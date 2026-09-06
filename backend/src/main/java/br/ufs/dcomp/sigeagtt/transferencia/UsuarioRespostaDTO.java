package br.ufs.dcomp.sigeagtt.transferencia;

import br.ufs.dcomp.sigeagtt.modelos.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modelos.Usuario;

import java.time.LocalDateTime;

public record UsuarioRespostaDTO(
    Long id,
    String nomeCompleto,
    String cpf,
    String cargo,
    String matriculaSigaa,
    PerfilUsuario perfil,
    Boolean ativo,
    LocalDateTime criadoEm
) {
    public static UsuarioRespostaDTO deEntidade(Usuario usuario) {
        return new UsuarioRespostaDTO(
            usuario.getId(),
            usuario.getNomeCompleto(),
            usuario.getCpf(),
            usuario.getCargo(),
            usuario.getMatriculaSigaa(),
            usuario.getPerfil(),
            usuario.getAtivo(),
            usuario.getCriadoEm()
        );
    }
}
