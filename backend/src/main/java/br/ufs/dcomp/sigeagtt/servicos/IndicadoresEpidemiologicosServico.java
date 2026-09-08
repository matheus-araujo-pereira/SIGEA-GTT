package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.ConsensoDupla;
import br.ufs.dcomp.sigeagtt.modelos.ItemConsenso;
import br.ufs.dcomp.sigeagtt.modelos.ProntuarioSimulado;
import br.ufs.dcomp.sigeagtt.repositorios.ConsensoDuplaRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.ItemConsensoRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.ValidacaoDocenteRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.RevisaoIndividualRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.AchadoGatilhoRepositorio;
import br.ufs.dcomp.sigeagtt.modelos.AchadoGatilho;
import br.ufs.dcomp.sigeagtt.modelos.RevisaoIndividual;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IndicadoresEpidemiologicosServico {

    private final ConsensoDuplaRepositorio consensoRepositorio;
    private final ValidacaoDocenteRepositorio validacaoDocenteRepositorio;
    private final ItemConsensoRepositorio itemConsensoRepositorio;
    private final RevisaoIndividualRepositorio revisaoRepositorio;
    private final ValidacaoDocenteRepositorio validacaoRepositorio;
    private final AchadoGatilhoRepositorio achadoRepositorio;

    public IndicadoresEpidemiologicosServico(ConsensoDuplaRepositorio consensoRepositorio,
            ValidacaoDocenteRepositorio validacaoDocenteRepositorio,
            ItemConsensoRepositorio itemConsensoRepositorio,
            RevisaoIndividualRepositorio revisaoRepositorio,
            AchadoGatilhoRepositorio achadoRepositorio) {
        this.consensoRepositorio = consensoRepositorio;
        this.validacaoDocenteRepositorio = validacaoDocenteRepositorio;
        this.itemConsensoRepositorio = itemConsensoRepositorio;
        this.revisaoRepositorio = revisaoRepositorio;
        this.validacaoRepositorio = validacaoDocenteRepositorio;
        this.achadoRepositorio = achadoRepositorio;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> calcularIndicadoresIndividuais(Long turmaId, String periodoLetivo,
            Long cenarioId, Long unidadeId,
            LocalDate dataInicio, LocalDate dataFim) {
        List<RevisaoIndividual> revisoes = revisaoRepositorio.findAll().stream()
                .filter(r -> r.getAtividade() != null && Boolean.TRUE.equals(r.getFinalizada()))
                .filter(r -> turmaId == null || r.getAtividade().getTurma().getId().equals(turmaId))
                .filter(r -> periodoLetivo == null
                        || r.getAtividade().getTurma().getPeriodoLetivo().equalsIgnoreCase(periodoLetivo))
                .filter(r -> cenarioId == null || r.getAtividade().getCenario().getId().equals(cenarioId))
                .filter(r -> unidadeId == null || r.getProntuario().getUnidadeHospitalar().getId().equals(unidadeId))
                .filter(r -> dataInicio == null || !r.getAtividade().getDataInicio().toLocalDate().isBefore(dataInicio))
                .filter(r -> dataFim == null || !r.getAtividade().getDataInicio().toLocalDate().isAfter(dataFim))
                .filter(r -> validacaoRepositorio.findByRevisaoIndividualId(r.getId())
                        .map(v -> Boolean.TRUE.equals(v.getHomologado())).orElse(false))
                .toList();

        int totalDias = 0;
        int totalEventos = 0;
        int casosComDano = 0;
        Map<String, Integer> severidades = new HashMap<>();
        severidades.put("CATEGORIA_E", 0);
        severidades.put("CATEGORIA_F", 0);
        severidades.put("CATEGORIA_G", 0);
        severidades.put("CATEGORIA_H", 0);
        severidades.put("CATEGORIA_I", 0);

        for (RevisaoIndividual revisao : revisoes) {
            Integer dias = revisao.getProntuario().getTempoPermanenciaDias();
            if (dias != null)
                totalDias += dias;
            boolean danoNoCaso = false;
            for (AchadoGatilho achado : achadoRepositorio.findByRevisaoIndividualId(revisao.getId())) {
                if (Boolean.TRUE.equals(achado.getConfirmouDano())
                        && !Boolean.TRUE.equals(achado.getDanoPresenteAdmissao())) {
                    totalEventos++;
                    danoNoCaso = true;
                    String severidade = achado.getGravidade() == null ? "CATEGORIA_E" : achado.getGravidade().name();
                    severidades.put(severidade, severidades.getOrDefault(severidade, 0) + 1);
                }
            }
            if (danoNoCaso)
                casosComDano++;
        }

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("totalProntuariosRevistos", revisoes.size());
        resultado.put("totalDiasInternacao", totalDias);
        resultado.put("totalEventosAdversos", totalEventos);
        resultado.put("prontuariosComDano", casosComDano);
        resultado.put("taxaDanosPorMilDias",
                totalDias == 0 ? 0 : Math.round((double) totalEventos / totalDias * 100000.0) / 100.0);
        resultado.put("frequenciaPorCemAdmissoes",
                revisoes.isEmpty() ? 0 : Math.round((double) totalEventos / revisoes.size() * 10000.0) / 100.0);
        resultado.put("prevalenciaPercentual",
                revisoes.isEmpty() ? 0 : Math.round((double) casosComDano / revisoes.size() * 10000.0) / 100.0);
        resultado.put("distribuicaoSeveridade", severidades);
        return resultado;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> calcularIndicadores(Long turmaId) {
        List<ConsensoDupla> consensos = consensoRepositorio.findAll();

        List<ConsensoDupla> homologados = consensos.stream().filter(c -> {
            if (turmaId != null) {
                Long tId = c.getDupla().getAtividade().getTurma().getId();
                if (!tId.equals(turmaId))
                    return false;
            }
            return validacaoDocenteRepositorio.findByConsensoDuplaId(c.getId())
                    .map(v -> Boolean.TRUE.equals(v.getHomologado()))
                    .orElse(false);
        }).toList();

        int totalProntuariosRevistos = homologados.size();
        int totalDiasInternacao = 0;
        int totalEventosAdversos = 0;
        int prontuariosComDano = 0;

        Map<String, Integer> distribuicaoSeveridade = new HashMap<>();
        distribuicaoSeveridade.put("CATEGORIA_E", 0);
        distribuicaoSeveridade.put("CATEGORIA_F", 0);
        distribuicaoSeveridade.put("CATEGORIA_G", 0);
        distribuicaoSeveridade.put("CATEGORIA_H", 0);
        distribuicaoSeveridade.put("CATEGORIA_I", 0);

        for (ConsensoDupla c : homologados) {
            ProntuarioSimulado p = c.getProntuario();
            if (p.getTempoPermanenciaDias() != null) {
                totalDiasInternacao += p.getTempoPermanenciaDias();
            }

            List<ItemConsenso> itens = itemConsensoRepositorio.findByConsensoDuplaId(c.getId());
            boolean temDanoNoCaso = false;

            for (ItemConsenso item : itens) {
                if (Boolean.TRUE.equals(item.getConfirmouDano())
                        && !Boolean.TRUE.equals(item.getDanoPresenteAdmissao())) {
                    totalEventosAdversos++;
                    temDanoNoCaso = true;

                    String sev = item.getGravidadeHomologada() != null
                            ? item.getGravidadeHomologada().name()
                            : (item.getGravidadeConsenso() != null ? item.getGravidadeConsenso().name()
                                    : "CATEGORIA_E");

                    distribuicaoSeveridade.put(sev, distribuicaoSeveridade.getOrDefault(sev, 0) + 1);
                }
            }

            if (temDanoNoCaso) {
                prontuariosComDano++;
            }
        }

        double taxaDanosPorMilDias = totalDiasInternacao > 0
                ? ((double) totalEventosAdversos / totalDiasInternacao) * 1000.0
                : 0.0;

        double frequenciaPorCemAdmissoes = totalProntuariosRevistos > 0
                ? ((double) totalEventosAdversos / totalProntuariosRevistos) * 100.0
                : 0.0;

        double prevalenciaPercentual = totalProntuariosRevistos > 0
                ? ((double) prontuariosComDano / totalProntuariosRevistos) * 100.0
                : 0.0;

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("totalProntuariosRevistos", totalProntuariosRevistos);
        resultado.put("totalDiasInternacao", totalDiasInternacao);
        resultado.put("totalEventosAdversos", totalEventosAdversos);
        resultado.put("prontuariosComDano", prontuariosComDano);
        resultado.put("taxaDanosPorMilDias", Math.round(taxaDanosPorMilDias * 100.0) / 100.0);
        resultado.put("frequenciaPorCemAdmissoes", Math.round(frequenciaPorCemAdmissoes * 100.0) / 100.0);
        resultado.put("prevalenciaPercentual", Math.round(prevalenciaPercentual * 100.0) / 100.0);
        resultado.put("distribuicaoSeveridade", distribuicaoSeveridade);

        return resultado;
    }
}
