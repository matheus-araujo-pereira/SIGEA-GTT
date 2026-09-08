package br.ufs.dcomp.sigeagtt.transferencia;

import java.util.List;

public record MelhoriaQualidadeRespostaDTO(
        Long revisaoIndividualId,
        IshikawaDTO ishikawa,
        List<Plano5w3hDTO> planos5w3h,
        PdcaDTO pdca) {
}
