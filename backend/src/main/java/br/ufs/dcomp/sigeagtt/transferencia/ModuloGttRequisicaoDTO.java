package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ModuloGttRequisicaoDTO(
    @NotBlank(message = "O código identificador do módulo é obrigatório")
    @Size(max = 30, message = "O código não pode exceder 30 caracteres")
    String codigo,

    @NotBlank(message = "O nome do módulo é obrigatório")
    @Size(max = 100, message = "O nome não pode exceder 100 caracteres")
    String nome,

    String descricao
) {
    public ModuloGttRequisicaoDTO {
        if (codigo != null) codigo = codigo.trim().toUpperCase();
        if (nome != null) nome = nome.trim();
    }
}
