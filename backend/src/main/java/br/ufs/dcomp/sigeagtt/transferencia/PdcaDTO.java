package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotBlank;

public record PdcaDTO(
    Long id,
    @NotBlank String planejar,
    @NotBlank String fazer,
    @NotBlank String checar,
    @NotBlank String agir
) {}
