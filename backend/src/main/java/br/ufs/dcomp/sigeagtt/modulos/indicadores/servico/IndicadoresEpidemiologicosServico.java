package br.ufs.dcomp.sigeagtt.modulos.indicadores.servico;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.AchadoGatilho;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.RevisaoIndividual;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.AchadoGatilhoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.RevisaoIndividualRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.ValidacaoDocenteRepositorio;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IndicadoresEpidemiologicosServico {

    private final RevisaoIndividualRepositorio revisaoRepositorio;
    private final ValidacaoDocenteRepositorio validacaoRepositorio;
    private final AchadoGatilhoRepositorio achadoRepositorio;

    public IndicadoresEpidemiologicosServico(RevisaoIndividualRepositorio revisaoRepositorio,
            AchadoGatilhoRepositorio achadoRepositorio,
            ValidacaoDocenteRepositorio validacaoRepositorio) {
        this.revisaoRepositorio = revisaoRepositorio;
        this.achadoRepositorio = achadoRepositorio;
        this.validacaoRepositorio = validacaoRepositorio;
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

}
