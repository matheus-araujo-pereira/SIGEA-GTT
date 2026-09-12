package br.ufs.dcomp.sigeagtt.modulos.auditoria.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record CorrigirAuditoriaRequisicaoDTO(
                @NotBlank String parecerDocente,
                @DecimalMin(value = "1.0", message = "A nota mínima é 1.0") @DecimalMax(value = "10.0", message = "A nota máxima é 10.0") BigDecimal nota,
                boolean homologada) {
}
