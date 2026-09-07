package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotNull;

public record IniciarRevisaoRequisicaoDTO(
    @NotNull(message = "O ID da dupla é obrigatório")
    Long duplaId,

    @NotNull(message = "O ID do aluno é obrigatório")
    Long alunoId,

    @NotNull(message = "O ID do prontuário é obrigatório")
    Long prontuarioId
) {}
