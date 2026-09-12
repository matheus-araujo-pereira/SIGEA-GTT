package br.ufs.dcomp.sigeagtt.modulos.gtt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GatilhoGttRequisicaoDTO(
    @NotBlank(message = "O código do gatilho é obrigatório (ex: C1, M4)")
    @Size(max = 10, message = "O código não pode exceder 10 caracteres")
    String codigo,

    @NotNull(message = "O módulo associado é obrigatório")
    Long moduloId,

    @NotBlank(message = "A descrição operacional do gatilho é obrigatória")
    String descricao,

    @Size(max = 150, message = "O limiar de referência não pode exceder 150 caracteres")
    String limiarReferencia
) {}
