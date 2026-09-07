package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotNull;

public record DuplaRevisoresRequisicaoDTO(
    @NotNull(message = "A atividade de auditoria é obrigatória")
    Long atividadeId,

    @NotNull(message = "O Aluno Revisor 1 é obrigatório")
    Long alunoRevisor1Id,

    @NotNull(message = "O Aluno Revisor 2 é obrigatório")
    Long alunoRevisor2Id
) {}
