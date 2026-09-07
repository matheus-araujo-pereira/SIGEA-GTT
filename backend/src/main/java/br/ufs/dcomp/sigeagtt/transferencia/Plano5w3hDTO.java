package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record Plano5w3hDTO(
    Long id,
    @NotBlank String oQue,
    @NotBlank String porQue,
    @NotBlank @Size(max = 100) String quem,
    @NotBlank @Size(max = 100) String onde,
    @NotBlank @Size(max = 100) String quando,
    @NotBlank String como,
    BigDecimal quantoCusta,
    @Size(max = 150) String comoMedir
) {}
