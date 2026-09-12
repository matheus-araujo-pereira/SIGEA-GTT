package br.ufs.dcomp.sigeagtt.modulos.educacional.dto;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.GravidadeNccMerp;

public record SubmissaoGatilhoDTO(
        Long id,
        Long gatilhoId,
        String gatilhoCodigo,
        String gatilhoDescricao,
        String moduloCodigo,
        String moduloNome,
        Long categoriaEaId,
        String categoriaEaNome,
        Boolean confirmouDano,
        String justificativaDano,
        Boolean danoPresenteAdmissao,
        GravidadeNccMerp gravidade) {}
