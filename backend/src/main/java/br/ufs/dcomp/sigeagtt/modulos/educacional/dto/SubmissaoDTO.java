package br.ufs.dcomp.sigeagtt.modulos.educacional.dto;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.StatusSubmissao;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.SubmissaoAtividade;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SubmissaoDTO(
        Long id,
        Long atividadeId,
        String atividadeTitulo,
        String disciplinaNome,
        String professorNome,
        Integer tempoLimiteMinutos,
        CasoClinicoDTO casoClinico,
        Long alunoId,
        String alunoNome,
        String alunoMatricula,
        String alunoEmail,
        StatusSubmissao status,
        Integer tempoGastoSegundos,
        LocalDateTime dataInicio,
        LocalDateTime dataSubmissao,
        Long professorCorretorId,
        String professorCorretorNome,
        BigDecimal nota,
        String parecerDocente,
        LocalDateTime dataAvaliacao,
        List<SubmissaoGatilhoDTO> achadosGatilhos,
        SubmissaoIshikawaDTO ishikawa,
        List<SubmissaoPlano5w3hDTO> planos5w3h,
        SubmissaoPdcaDTO pdca) {
    public static SubmissaoDTO deEntidade(
            SubmissaoAtividade s,
            List<SubmissaoGatilhoDTO> achados,
            SubmissaoIshikawaDTO ishikawa,
            List<SubmissaoPlano5w3hDTO> planos,
            SubmissaoPdcaDTO pdca) {
        return new SubmissaoDTO(
                s.getId(),
                s.getAtividade() != null ? s.getAtividade().getId() : null,
                s.getAtividade() != null ? s.getAtividade().getTitulo() : null,
                s.getAtividade() != null && s.getAtividade().getTurma() != null
                        ? s.getAtividade().getTurma().getNomeDisciplina()
                        : null,
                s.getAtividade() != null
                                && s.getAtividade().getTurma() != null
                                && s.getAtividade().getTurma().getProfessorResponsavel() != null
                        ? s.getAtividade().getTurma().getProfessorResponsavel().getNomeCompleto()
                        : null,
                s.getAtividade() != null ? s.getAtividade().getTempoLimiteMinutos() : 20,
                s.getAtividade() != null && s.getAtividade().getCasoClinico() != null
                        ? CasoClinicoDTO.deEntidade(s.getAtividade().getCasoClinico())
                        : null,
                s.getAluno() != null ? s.getAluno().getId() : null,
                s.getAluno() != null ? s.getAluno().getNomeCompleto() : null,
                s.getAluno() != null ? s.getAluno().getMatriculaSigaa() : null,
                s.getAluno() != null ? s.getAluno().getEmail() : null,
                s.getStatus(),
                s.getTempoGastoSegundos(),
                s.getDataInicio(),
                s.getDataSubmissao(),
                s.getProfessorCorretor() != null ? s.getProfessorCorretor().getId() : null,
                s.getProfessorCorretor() != null
                        ? s.getProfessorCorretor().getNomeCompleto()
                        : null,
                s.getNota(),
                s.getParecerDocente(),
                s.getDataAvaliacao(),
                achados,
                ishikawa,
                planos,
                pdca);
    }
}
