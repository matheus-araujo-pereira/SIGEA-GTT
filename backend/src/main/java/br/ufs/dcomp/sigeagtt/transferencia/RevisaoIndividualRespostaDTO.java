package br.ufs.dcomp.sigeagtt.transferencia;

import br.ufs.dcomp.sigeagtt.modelos.RevisaoIndividual;

import java.time.LocalDateTime;
import java.util.List;

public record RevisaoIndividualRespostaDTO(
    Long id,
    Long duplaId,
    Long alunoId,
    String alunoNome,
    Long prontuarioId,
    String prontuarioAtendimento,
    Integer tempoGastoSegundos,
    Boolean finalizada,
    LocalDateTime dataSubmissao,
    List<AchadoGatilhoDTO> achados
) {
    public static RevisaoIndividualRespostaDTO deEntidade(RevisaoIndividual r, List<AchadoGatilhoDTO> achados) {
        return new RevisaoIndividualRespostaDTO(
            r.getId(),
            r.getDupla().getId(),
            r.getAluno().getId(),
            r.getAluno().getNomeCompleto(),
            r.getProntuario().getId(),
            r.getProntuario().getNumeroAtendimento(),
            r.getTempoGastoSegundos(),
            r.getFinalizada(),
            r.getDataSubmissao(),
            achados
        );
    }
}
