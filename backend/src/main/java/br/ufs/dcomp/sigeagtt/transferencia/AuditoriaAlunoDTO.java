package br.ufs.dcomp.sigeagtt.transferencia;

import java.util.List;

public record AuditoriaAlunoDTO(
        Long alunoId,
        String alunoNome,
        String alunoMatricula,
        List<RevisaoIndividualRespostaDTO> revisoes) {
}