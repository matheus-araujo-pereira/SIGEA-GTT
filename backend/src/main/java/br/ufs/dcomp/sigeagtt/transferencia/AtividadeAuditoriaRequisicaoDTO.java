package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record AtividadeAuditoriaRequisicaoDTO(
    @NotNull(message = "A turma é obrigatória")
    Long turmaId,

    @NotNull(message = "O cenário clínico é obrigatório")
    Long cenarioId,

    @NotBlank(message = "O título da atividade é obrigatório")
    @Size(max = 150, message = "O título não pode exceder 150 caracteres")
    String titulo,

    @NotNull(message = "A data de início é obrigatória")
    LocalDateTime dataInicio,

    @NotNull(message = "A data de término é obrigatória")
    LocalDateTime dataFim,

    @NotNull(message = "O tempo limite de revisão por prontuário é obrigatório")
    @Positive(message = "O tempo limite deve ser positivo")
    Integer tempoLimiteMinutos
) {}
