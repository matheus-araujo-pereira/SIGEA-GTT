package br.ufs.dcomp.sigeagtt.transferencia;

import br.ufs.dcomp.sigeagtt.modelos.Turma;

import java.time.LocalDateTime;

public record TurmaRespostaDTO(
    Long id,
    String codigoDisciplina,
    String periodoLetivo,
    String anoSemestre,
    Boolean ativa,
    LocalDateTime criadaEm,
    Long professorResponsavelId,
    String professorResponsavelNome,
    long totalAlunos
) {
    public static TurmaRespostaDTO deEntidade(Turma turma, long totalAlunos) {
        return new TurmaRespostaDTO(
            turma.getId(),
            turma.getCodigoDisciplina(),
            turma.getPeriodoLetivo(),
            turma.getAnoSemestre(),
            turma.getAtiva(),
            turma.getCriadaEm(),
            turma.getProfessorResponsavel().getId(),
            turma.getProfessorResponsavel().getNomeCompleto(),
            totalAlunos
        );
    }
}
