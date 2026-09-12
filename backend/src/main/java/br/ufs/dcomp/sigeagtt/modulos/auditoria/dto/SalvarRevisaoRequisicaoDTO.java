package br.ufs.dcomp.sigeagtt.modulos.auditoria.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record SalvarRevisaoRequisicaoDTO(
    @NotNull(message = "O tempo gasto em segundos é obrigatório")
    Integer tempoGastoSegundos,

    Boolean finalizar,
    List<AchadoGatilhoDTO> achados
) {}
