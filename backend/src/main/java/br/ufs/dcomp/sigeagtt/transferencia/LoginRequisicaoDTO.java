package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotBlank;

public record LoginRequisicaoDTO(
    @NotBlank(message = "O identificador institucional (CPF) é obrigatório")
    String identificador,

    @NotBlank(message = "A senha institucional é obrigatória")
    String senha
) {
    public LoginRequisicaoDTO {
        if (identificador != null) {
            identificador = identificador.replaceAll("\\D", "");
        }
    }
}
