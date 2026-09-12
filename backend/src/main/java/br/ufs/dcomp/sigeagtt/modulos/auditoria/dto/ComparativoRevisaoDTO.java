package br.ufs.dcomp.sigeagtt.modulos.auditoria.dto;

import java.util.List;

public record ComparativoRevisaoDTO(
    Long revisor1Id,
    String revisor1Nome,
    Boolean revisor1Finalizou,
    Integer revisor1TempoSegundos,
    List<AchadoGatilhoDTO> revisor1Achados,

    Long revisor2Id,
    String revisor2Nome,
    Boolean revisor2Finalizou,
    Integer revisor2TempoSegundos,
    List<AchadoGatilhoDTO> revisor2Achados
) {}
