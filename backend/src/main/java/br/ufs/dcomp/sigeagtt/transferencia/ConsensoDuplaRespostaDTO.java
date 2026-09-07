package br.ufs.dcomp.sigeagtt.transferencia;

import br.ufs.dcomp.sigeagtt.modelos.ConsensoDupla;

import java.time.LocalDateTime;
import java.util.List;

public record ConsensoDuplaRespostaDTO(
    Long id,
    Long duplaId,
    Long prontuarioId,
    String prontuarioAtendimento,
    LocalDateTime dataConsenso,
    Boolean submetido,
    List<ItemConsensoDTO> itens,
    ValidacaoDocenteDTO validacao,
    ComparativoRevisaoDTO comparativo
) {
    public static ConsensoDuplaRespostaDTO deEntidade(
        ConsensoDupla c,
        List<ItemConsensoDTO> itens,
        ValidacaoDocenteDTO validacao,
        ComparativoRevisaoDTO comparativo
    ) {
        return new ConsensoDuplaRespostaDTO(
            c.getId(),
            c.getDupla().getId(),
            c.getProntuario().getId(),
            c.getProntuario().getNumeroAtendimento(),
            c.getDataConsenso(),
            c.getSubmetido(),
            itens,
            validacao,
            comparativo
        );
    }
}
