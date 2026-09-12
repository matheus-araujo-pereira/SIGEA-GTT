package br.ufs.dcomp.sigeagtt.modulos.auditoria.dto;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.GravidadeNccMerp;

import jakarta.validation.constraints.NotNull;

public record AchadoGatilhoDTO(
    Long id,

    @NotNull(message = "O gatilho é obrigatório")
    Long gatilhoId,

    String gatilhoCodigo,
    String gatilhoDescricao,
    String moduloNome,
    Boolean confirmouDano,
    String justificativaDano,
    Boolean danoPresenteAdmissao,
    GravidadeNccMerp gravidade
) {}
