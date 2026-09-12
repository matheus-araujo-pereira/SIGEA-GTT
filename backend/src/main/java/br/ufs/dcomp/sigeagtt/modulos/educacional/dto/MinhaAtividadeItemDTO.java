package br.ufs.dcomp.sigeagtt.modulos.educacional.dto;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.StatusSubmissao;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MinhaAtividadeItemDTO(
        Long atividadeId,
        String titulo,
        Long turmaId,
        String codigoDisciplina,
        String nomeDisciplina,
        String professorNome,
        Long casoClinicoId,
        String casoClinicoTitulo,
        String unidadeHospitalarSigla,
        LocalDateTime dataInicio,
        LocalDateTime dataFim,
        Integer tempoLimiteMinutos,
        Long submissaoId,
        StatusSubmissao status, // null se não iniciou, EM_ANDAMENTO, SUBMETIDA, AVALIADA
        BigDecimal nota,
        Integer tempoGastoSegundos,
        LocalDateTime dataSubmissao,
        LocalDateTime dataAvaliacao) {
}
