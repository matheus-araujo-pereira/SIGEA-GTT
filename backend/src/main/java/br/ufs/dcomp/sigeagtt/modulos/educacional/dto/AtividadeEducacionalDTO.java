package br.ufs.dcomp.sigeagtt.modulos.educacional.dto;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.AtividadeEducacional;
import java.time.LocalDateTime;

public record AtividadeEducacionalDTO(
    Long id,
    Long turmaId,
    String turmaCodigo,
    String turmaDisciplina,
    String periodoLetivo,
    Long casoClinicoId,
    String casoClinicoTitulo,
    String titulo,
    String orientacoesPedagogicas,
    LocalDateTime dataInicio,
    LocalDateTime dataFim,
    Integer tempoLimiteMinutos,
    Boolean ativa,
    LocalDateTime criadaEm,
    Integer totalAlunosTurma,
    Integer totalSubmissoes,
    Integer totalAvaliadas
) {
    public static AtividadeEducacionalDTO deEntidade(AtividadeEducacional a, int totalAlunos, int totalSubmissoes, int totalAvaliadas) {
        return new AtividadeEducacionalDTO(
            a.getId(),
            a.getTurma() != null ? a.getTurma().getId() : null,
            a.getTurma() != null ? a.getTurma().getCodigoDisciplina() : null,
            a.getTurma() != null ? a.getTurma().getNomeDisciplina() : null,
            a.getTurma() != null ? a.getTurma().getPeriodoLetivo() : null,
            a.getCasoClinico() != null ? a.getCasoClinico().getId() : null,
            a.getCasoClinico() != null ? a.getCasoClinico().getTitulo() : null,
            a.getTitulo(),
            a.getOrientacoesPedagogicas(),
            a.getDataInicio(),
            a.getDataFim(),
            a.getTempoLimiteMinutos(),
            a.getAtiva(),
            a.getCriadaEm(),
            totalAlunos,
            totalSubmissoes,
            totalAvaliadas
        );
    }
}
