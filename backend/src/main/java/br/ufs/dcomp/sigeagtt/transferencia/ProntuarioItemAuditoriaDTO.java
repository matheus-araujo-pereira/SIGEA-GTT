package br.ufs.dcomp.sigeagtt.transferencia;

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
