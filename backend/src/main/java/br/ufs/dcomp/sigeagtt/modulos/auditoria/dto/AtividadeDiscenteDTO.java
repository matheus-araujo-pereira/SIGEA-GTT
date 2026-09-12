package br.ufs.dcomp.sigeagtt.modulos.auditoria.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AtividadeDiscenteDTO(
    Long atividadeId,
    String atividadeTitulo,
    Long turmaId,
    String turmaCodigo,
    Long cenarioId,
    String cenarioTitulo,
    Long duplaId,
    String parceiroNome,
    String parceiroMatricula,
    LocalDateTime dataInicio,
    LocalDateTime dataFim,
    Integer tempoLimiteMinutos,
    Boolean finalizada,
    List<ProntuarioItemAuditoriaDTO> prontuarios
) {}
