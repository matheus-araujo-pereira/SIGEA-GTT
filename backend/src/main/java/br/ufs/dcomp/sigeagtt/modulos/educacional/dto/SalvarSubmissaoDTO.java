package br.ufs.dcomp.sigeagtt.modulos.educacional.dto;

import java.util.List;

public record SalvarSubmissaoDTO(
    Integer tempoGastoSegundos,
    Boolean finalizar,
    List<SubmissaoGatilhoDTO> achadosGatilhos,
    SubmissaoIshikawaDTO ishikawa,
    List<SubmissaoPlano5w3hDTO> planos5w3h,
    SubmissaoPdcaDTO pdca
) {}
