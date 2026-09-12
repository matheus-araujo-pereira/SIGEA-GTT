package br.ufs.dcomp.sigeagtt.modulos.auditoria.dto;

import jakarta.validation.constraints.NotBlank;

public record CorrigirAuditoriaRequisicaoDTO(
        @NotBlank String parecerDocente,
        boolean homologada) {
}
