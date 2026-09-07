package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TurmaRequisicaoDTO(
    @NotBlank(message = "O código da disciplina é obrigatório")
    @Size(max = 30, message = "O código não pode exceder 30 caracteres")
    String codigoDisciplina,

    @NotBlank(message = "O período letivo é obrigatório (ex: 2026.1)")
    @Size(max = 20, message = "O período letivo não pode exceder 20 caracteres")
    String periodoLetivo,

    @NotBlank(message = "O ano/semestre é obrigatório (ex: 2026/1)")
    @Size(max = 10, message = "O ano/semestre não pode exceder 10 caracteres")
    String anoSemestre,

    @NotNull(message = "O ID do professor responsável é obrigatório")
    Long professorResponsavelId
) {}
