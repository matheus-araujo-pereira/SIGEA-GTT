package br.ufs.dcomp.sigeagtt.modulos.educacional.dto;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.StatusSubmissao;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AlunoProgressoDTO(
    Long alunoId,
    String alunoNome,
    String alunoEmail,
    String alunoMatricula,
    Long submissaoId,
    StatusSubmissao status,
    Integer tempoGastoSegundos,
    LocalDateTime dataSubmissao,
    BigDecimal nota,
    String parecerDocente,
    LocalDateTime dataAvaliacao
) {}
