package br.ufs.dcomp.sigeagtt.transferencia;

import br.ufs.dcomp.sigeagtt.modelos.GravidadeNccMerp;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record HomologarConsensoDTO(
    @NotNull(message = "O ID do professor validador é obrigatório")
    Long professorValidadorId,

    @NotBlank(message = "O parecer formativo da auditoria é obrigatório")
    String parecerFormativo,

    @NotNull(message = "O status de homologação é obrigatório")
    Boolean homologado,

    Map<Long, GravidadeNccMerp> reclassificacoesGravidade
) {}
