package br.ufs.dcomp.sigeagtt.modulos.qualidade.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record Plano5w3hDTO(
    Long id,
    @NotBlank(message = "O campo 'O que' é obrigatório") String oQue,
    @NotBlank(message = "O campo 'Por que' é obrigatório") String porQue,
    @NotBlank(message = "O campo 'Quem' é obrigatório") @Size(max = 100, message = "O campo 'Quem' não pode exceder 100 caracteres") String quem,
    @NotBlank(message = "O campo 'Onde' é obrigatório") @Size(max = 100, message = "O campo 'Onde' não pode exceder 100 caracteres") String onde,
    @NotBlank(message = "O campo 'Quando' é obrigatório") @Size(max = 100, message = "O campo 'Quando' não pode exceder 100 caracteres") String quando,
    @NotBlank(message = "O campo 'Como' é obrigatório") String como,
    BigDecimal quantoCusta,
    @Size(max = 150, message = "O campo 'Como medir' não pode exceder 150 caracteres") String comoMedir
) {}
