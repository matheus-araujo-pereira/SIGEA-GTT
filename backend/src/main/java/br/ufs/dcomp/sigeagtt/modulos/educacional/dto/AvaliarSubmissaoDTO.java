package br.ufs.dcomp.sigeagtt.modulos.educacional.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AvaliarSubmissaoDTO(
        @NotNull(message = "A nota é obrigatória") @DecimalMin(value = "0.00", message = "A nota mínima é 0.0") @DecimalMax(value = "10.00", message = "A nota máxima é 10.0") BigDecimal nota,

        @NotBlank(message = "O parecer formativo é obrigatório") String parecerDocente) {
}
