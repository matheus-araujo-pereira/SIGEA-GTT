package br.ufs.dcomp.sigeagtt.modulos.auditoria.dto;

import java.util.List;

public record AuditoriaAlunoDTO(
        Long alunoId,
        String alunoNome,
        String alunoMatricula,
        List<RevisaoIndividualRespostaDTO> revisoes) {
}
