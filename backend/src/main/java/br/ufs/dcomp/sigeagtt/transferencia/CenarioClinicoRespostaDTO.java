package br.ufs.dcomp.sigeagtt.transferencia;

import br.ufs.dcomp.sigeagtt.modelos.CenarioClinico;

import java.time.LocalDateTime;

public record CenarioClinicoRespostaDTO(
    Long id,
    String titulo,
    String descricaoPedagogica,
    String objetivosAprendizagem,
    LocalDateTime criadoEm,
    Long professorCriadorId,
    String professorCriadorNome
) {
    public static CenarioClinicoRespostaDTO deEntidade(CenarioClinico cenario) {
        return new CenarioClinicoRespostaDTO(
            cenario.getId(),
            cenario.getTitulo(),
            cenario.getDescricaoPedagogica(),
            cenario.getObjetivosAprendizagem(),
            cenario.getCriadoEm(),
            cenario.getProfessorCriador().getId(),
            cenario.getProfessorCriador().getNomeCompleto()
        );
    }
}
