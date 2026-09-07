package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotNull;

public record IniciarRevisaoRequisicaoDTO(
    @NotNull Long duplaId,
    @NotNull Long alunoId,
    @NotNull Long prontuarioId
) {}
