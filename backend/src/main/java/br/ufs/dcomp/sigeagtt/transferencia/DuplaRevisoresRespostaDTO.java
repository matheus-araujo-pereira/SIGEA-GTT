package br.ufs.dcomp.sigeagtt.transferencia;

import br.ufs.dcomp.sigeagtt.modelos.DuplaRevisores;

public record DuplaRevisoresRespostaDTO(
    Long id,
    Long atividadeId,
    Long alunoRevisor1Id,
    String alunoRevisor1Nome,
    String alunoRevisor1Matricula,
    Long alunoRevisor2Id,
    String alunoRevisor2Nome,
    String alunoRevisor2Matricula,
    Boolean ativa
) {
    public static DuplaRevisoresRespostaDTO deEntidade(DuplaRevisores d) {
        return new DuplaRevisoresRespostaDTO(
            d.getId(),
            d.getAtividade().getId(),
            d.getAlunoRevisor1().getId(),
            d.getAlunoRevisor1().getNomeCompleto(),
            d.getAlunoRevisor1().getMatriculaSigaa(),
            d.getAlunoRevisor2().getId(),
            d.getAlunoRevisor2().getNomeCompleto(),
            d.getAlunoRevisor2().getMatriculaSigaa(),
            d.getAtiva()
        );
    }
}
