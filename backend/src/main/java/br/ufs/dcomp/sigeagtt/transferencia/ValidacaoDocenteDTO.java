package br.ufs.dcomp.sigeagtt.transferencia;

import java.time.LocalDateTime;

public record ValidacaoDocenteDTO(
    Long id,
    Long professorValidadorId,
    String professorValidadorNome,
    String parecerFormativo,
    Boolean homologado,
    LocalDateTime dataValidacao
) {}
