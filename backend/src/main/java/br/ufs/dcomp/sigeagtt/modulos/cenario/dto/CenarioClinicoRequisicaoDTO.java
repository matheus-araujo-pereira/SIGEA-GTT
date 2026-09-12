package br.ufs.dcomp.sigeagtt.modulos.cenario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CenarioClinicoRequisicaoDTO(
    @NotBlank(message = "O título do cenário clínico é obrigatório")
    @Size(max = 150, message = "O título não pode exceder 150 caracteres")
    String titulo,

    @NotBlank(message = "A descrição pedagógica é obrigatória")
    String descricaoPedagogica,

    @NotBlank(message = "Os objetivos de aprendizagem são obrigatórios")
    String objetivosAprendizagem,

    @NotNull(message = "O ID do professor criador é obrigatório")
    Long professorCriadorId
) {}
