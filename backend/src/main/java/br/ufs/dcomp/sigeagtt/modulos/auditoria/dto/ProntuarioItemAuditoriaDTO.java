package br.ufs.dcomp.sigeagtt.modulos.auditoria.dto;


public record ProntuarioItemAuditoriaDTO(
    Long prontuarioId,
    String numeroAtendimento,
    String unidadeSigla,
    Integer idadePaciente,
    Integer tempoPermanenciaDias,
    Long revisaoId,
    Boolean finalizada,
    Integer tempoGastoSegundos,
    int totalGatilhos,
    int totalDanosConfirmados
) {}
