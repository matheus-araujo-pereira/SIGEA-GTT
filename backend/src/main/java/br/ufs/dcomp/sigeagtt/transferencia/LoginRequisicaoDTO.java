package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotBlank;

public record LoginRequisicaoDTO(
    @NotBlank(message = "O CPF ou E-mail é obrigatório")
    String identificador,

    @NotBlank(message = "A senha é obrigatória")
    String senha
) {
    public LoginRequisicaoDTO {
        if (identificador != null) {
            identificador = identificador.trim();
        }
    }
}
