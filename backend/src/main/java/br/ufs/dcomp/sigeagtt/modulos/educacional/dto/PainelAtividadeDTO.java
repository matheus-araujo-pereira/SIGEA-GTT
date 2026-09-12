package br.ufs.dcomp.sigeagtt.modulos.educacional.dto;

import java.math.BigDecimal;
import java.util.List;

public record PainelAtividadeDTO(
    AtividadeEducacionalDTO atividade,
    CasoClinicoDTO casoClinico,
    Integer totalAlunos,
    Integer totalSubmissoes,
    Integer totalPendentesCorrecao,
    Integer totalAvaliadas,
    BigDecimal mediaNotas,
    List<AlunoProgressoDTO> alunos
) {}
