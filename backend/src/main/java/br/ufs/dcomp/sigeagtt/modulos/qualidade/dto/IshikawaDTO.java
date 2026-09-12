package br.ufs.dcomp.sigeagtt.modulos.qualidade.dto;

import jakarta.validation.constraints.NotBlank;

public record IshikawaDTO(
    Long id,
    @NotBlank(message = "O efeito principal é obrigatório") String efeitoPrincipal,
    String metodo,
    String maoDeObra,
    String material,
    String medida,
    String meioAmbiente,
    String maquina
) {}
