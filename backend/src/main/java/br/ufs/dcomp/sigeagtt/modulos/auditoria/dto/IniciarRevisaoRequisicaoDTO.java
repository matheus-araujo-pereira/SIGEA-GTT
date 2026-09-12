package br.ufs.dcomp.sigeagtt.modulos.auditoria.dto;

import jakarta.validation.constraints.NotNull;

public record IniciarRevisaoRequisicaoDTO(
        @NotNull(message = "O ID da atividade é obrigatório") Long atividadeId,

        @NotNull(message = "O ID do aluno é obrigatório") Long alunoId,

        @NotNull(message = "O ID do prontuário é obrigatório") Long prontuarioId) {
}
