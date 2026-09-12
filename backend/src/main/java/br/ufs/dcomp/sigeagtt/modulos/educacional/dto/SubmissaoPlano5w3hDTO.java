package br.ufs.dcomp.sigeagtt.modulos.educacional.dto;

import java.math.BigDecimal;

public record SubmissaoPlano5w3hDTO(
        Long id,
        String oQue,
        String porQue,
        String quem,
        String onde,
        String quando,
        String como,
        BigDecimal quantoCusta,
        String comoMedir) {
}
