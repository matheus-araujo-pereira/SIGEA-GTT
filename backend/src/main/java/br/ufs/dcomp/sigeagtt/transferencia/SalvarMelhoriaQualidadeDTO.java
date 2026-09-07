package br.ufs.dcomp.sigeagtt.transferencia;

import java.util.List;

public record SalvarMelhoriaQualidadeDTO(
    IshikawaDTO ishikawa,
    List<Plano5w3hDTO> planos5w3h,
    PdcaDTO pdca
) {}
