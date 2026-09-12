package br.ufs.dcomp.sigeagtt.modulos.educacional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record SalvarAtividadeDTO(
        @NotNull Long turmaId,
        @NotNull Long casoClinicoId,
        @NotBlank String titulo,
        String orientacoesPedagogicas,
        @NotNull LocalDateTime dataInicio,
        @NotNull LocalDateTime dataFim,
        @NotNull Integer tempoLimiteMinutos,
        Boolean ativa) {}
