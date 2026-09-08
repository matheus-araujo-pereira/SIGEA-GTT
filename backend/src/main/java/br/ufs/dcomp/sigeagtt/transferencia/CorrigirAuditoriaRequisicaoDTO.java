package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotBlank;

public record CorrigirAuditoriaRequisicaoDTO(
        @NotBlank String parecerDocente,
        boolean homologada) {
}