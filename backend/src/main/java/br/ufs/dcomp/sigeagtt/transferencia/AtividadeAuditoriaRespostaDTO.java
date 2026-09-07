package br.ufs.dcomp.sigeagtt.transferencia;

import br.ufs.dcomp.sigeagtt.modelos.AtividadeAuditoria;

import java.time.LocalDateTime;

public record AtividadeAuditoriaRespostaDTO(
    Long id,
    Long turmaId,
    String turmaCodigo,
    String turmaPeriodo,
    Long cenarioId,
    String cenarioTitulo,
    String titulo,
    LocalDateTime dataInicio,
    LocalDateTime dataFim,
    Integer tempoLimiteMinutos,
    Boolean finalizada,
    long totalDuplas
) {
    public static AtividadeAuditoriaRespostaDTO deEntidade(AtividadeAuditoria at, long totalDuplas) {
        return new AtividadeAuditoriaRespostaDTO(
            at.getId(),
            at.getTurma().getId(),
            at.getTurma().getCodigoDisciplina(),
            at.getTurma().getPeriodoLetivo(),
            at.getCenario().getId(),
            at.getCenario().getTitulo(),
            at.getTitulo(),
            at.getDataInicio(),
            at.getDataFim(),
            at.getTempoLimiteMinutos(),
            at.getFinalizada(),
            totalDuplas
        );
    }
}
