package br.ufs.dcomp.sigeagtt.transferencia;

import br.ufs.dcomp.sigeagtt.modelos.GravidadeNccMerp;
import jakarta.validation.constraints.NotNull;

public record ItemConsensoDTO(
    Long id,

    @NotNull(message = "O gatilho é obrigatório")
    Long gatilhoId,

    String gatilhoCodigo,
    String gatilhoDescricao,
    String moduloNome,
    Boolean confirmouDano,
    String justificativaDano,
    Boolean danoPresenteAdmissao,

    @NotNull(message = "A gravidade de consenso da dupla é obrigatória")
    GravidadeNccMerp gravidadeConsenso,

    GravidadeNccMerp gravidadeHomologada
) {}
