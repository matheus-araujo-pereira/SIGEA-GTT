package br.ufs.dcomp.sigeagtt.modulos.qualidade.dto;

import jakarta.validation.constraints.NotBlank;

public record PdcaDTO(
    Long id,
    @NotBlank(message = "A etapa 'Planejar' é obrigatória") String planejar,
    @NotBlank(message = "A etapa 'Fazer' é obrigatória") String fazer,
    @NotBlank(message = "A etapa 'Checar' é obrigatória") String checar,
    @NotBlank(message = "A etapa 'Agir' é obrigatória") String agir
) {}
