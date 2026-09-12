package br.ufs.dcomp.sigeagtt.modulos.auditoria.dto;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.RevisaoIndividual;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.IshikawaDTO;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.PdcaDTO;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.Plano5w3hDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record RevisaoIndividualRespostaDTO(
        Long id,
        Long atividadeId,
        String atividadeTitulo,
        Long alunoId,
        String alunoNome,
        Long prontuarioId,
        String prontuarioAtendimento,
        Integer tempoGastoSegundos,
        Boolean finalizada,
        LocalDateTime dataSubmissao,
        List<AchadoGatilhoDTO> achados,
        String parecerDocente,
        BigDecimal nota,
        Boolean homologada,
        IshikawaDTO ishikawa,
        List<Plano5w3hDTO> planos5w3h,
        PdcaDTO pdca) {
    public static RevisaoIndividualRespostaDTO deEntidade(RevisaoIndividual r, List<AchadoGatilhoDTO> achados) {
        return new RevisaoIndividualRespostaDTO(
                r.getId(),
                r.getAtividade() != null ? r.getAtividade().getId() : null,
                r.getAtividade() != null ? r.getAtividade().getTitulo() : null,
                r.getAluno().getId(),
                r.getAluno().getNomeCompleto(),
                r.getProntuario().getId(),
                r.getProntuario().getNumeroAtendimento(),
                r.getTempoGastoSegundos(),
                r.getFinalizada(),
                r.getDataSubmissao(),
                achados,
                null,
                null,
                false,
                null,
                null,
                null);
    }
}
