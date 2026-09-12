package br.ufs.dcomp.sigeagtt.modulos.auditoria.dto;

import java.time.LocalDateTime;

public record ValidacaoDocenteDTO(
    Long id,
    Long professorValidadorId,
    String professorValidadorNome,
    String parecerFormativo,
    Boolean homologado,
    LocalDateTime dataValidacao
) {}
