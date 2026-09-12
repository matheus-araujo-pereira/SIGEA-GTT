package br.ufs.dcomp.sigeagtt.modulos.auditoria.dto;

import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.IshikawaDTO;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.PdcaDTO;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.Plano5w3hDTO;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record SalvarRevisaoRequisicaoDTO(
        @NotNull(message = "O tempo gasto em segundos é obrigatório") Integer tempoGastoSegundos,

        Boolean finalizar,
        List<AchadoGatilhoDTO> achados,
        IshikawaDTO ishikawa,
        List<Plano5w3hDTO> planos5w3h,
        PdcaDTO pdca) {
}
