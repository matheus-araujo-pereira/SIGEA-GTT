package br.ufs.dcomp.sigeagtt.modulos.indicadores.servico;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.AchadoGatilho;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.GravidadeNccMerp;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.RevisaoIndividual;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.ValidacaoDocente;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.AchadoGatilhoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.RevisaoIndividualRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.ValidacaoDocenteRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.gtt.modelo.GatilhoGtt;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

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

    public Map<String, Object> calcularIndicadoresIndividuais(Long turmaId, String periodoLetivo,
            Long cenarioId, Long unidadeId,
            LocalDate dataInicio, LocalDate dataFim) {
        return calcularIndicadoresIndividuais(turmaId, periodoLetivo, cenarioId, unidadeId, dataInicio, dataFim, null,
                null, null);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> calcularIndicadoresIndividuais(Long turmaId, String periodoLetivo,
            Long cenarioId, Long unidadeId,
            LocalDate dataInicio, LocalDate dataFim,
            String moduloCodigo, String gravidade, Boolean danoPresenteAdmissao) {

        List<RevisaoIndividual> revisoes = filtrarRevisoesHomologadas(turmaId, periodoLetivo, cenarioId, unidadeId,
                dataInicio, dataFim);

        int totalDias = 0;
        int totalEventos = 0;
        int eventosIntrahospitalares = 0;
        int eventosPresentesAdmissao = 0;
        int casosComDano = 0;
        int totalGatilhosRastreados = 0;
        int totalDanosConfirmadosGeral = 0;

        Map<String, Integer> severidades = new LinkedHashMap<>();
        severidades.put("CATEGORIA_E", 0);
        severidades.put("CATEGORIA_F", 0);
        severidades.put("CATEGORIA_G", 0);
        severidades.put("CATEGORIA_H", 0);
        severidades.put("CATEGORIA_I", 0);

        Map<String, Integer> distribuicaoModulos = new LinkedHashMap<>();
        distribuicaoModulos.put("CUIDADOS", 0);
        distribuicaoModulos.put("MEDICACAO", 0);
        distribuicaoModulos.put("CIRURGICO", 0);
        distribuicaoModulos.put("TERAPIA_INTENSIVA", 0);
        distribuicaoModulos.put("PERINATAL", 0);
        distribuicaoModulos.put("URGENCIA", 0);

        // Agrupamento temporal para o Run Chart do IHI
        Map<YearMonth, AgregadoTemporal> agregadoTemporal = new TreeMap<>();

        for (RevisaoIndividual revisao : revisoes) {
            Integer dias = revisao.getProntuario().getTempoPermanenciaDias();
            int diasValidos = dias != null && dias > 0 ? dias : 1;
            totalDias += diasValidos;

            LocalDate dataRef = revisao.getDataSubmissao() != null ? revisao.getDataSubmissao().toLocalDate()
                    : (revisao.getAtividade().getDataInicio() != null
                            ? revisao.getAtividade().getDataInicio().toLocalDate()
                            : LocalDate.now());
            YearMonth ym = YearMonth.from(dataRef);
            AgregadoTemporal agg = agregadoTemporal.computeIfAbsent(ym, k -> new AgregadoTemporal());
            agg.prontuarios++;
            agg.dias += diasValidos;

            List<AchadoGatilho> achados = achadoRepositorio.findByRevisaoIndividualId(revisao.getId());
            boolean danoNoCaso = false;

            for (AchadoGatilho achado : achados) {
                totalGatilhosRastreados++;

                if (Boolean.TRUE.equals(achado.getConfirmouDano())) {
                    totalDanosConfirmadosGeral++;

                    // Filtros específicos de achado se fornecidos
                    if (moduloCodigo != null && !moduloCodigo.isBlank() && !moduloCodigo.equalsIgnoreCase("TODOS")) {
                        if (achado.getGatilho() == null || achado.getGatilho().getModulo() == null
                                || !achado.getGatilho().getModulo().getCodigo().equalsIgnoreCase(moduloCodigo)) {
                            continue;
                        }
                    }

                    if (gravidade != null && !gravidade.isBlank() && !gravidade.equalsIgnoreCase("TODOS")) {
                        if (achado.getGravidade() == null
                                || !achado.getGravidade().name().equalsIgnoreCase(gravidade)) {
                            continue;
                        }
                    }

                    if (danoPresenteAdmissao != null) {
                        if (!Objects.equals(achado.getDanoPresenteAdmissao(), danoPresenteAdmissao)) {
                            continue;
                        }
                    }

                    totalEventos++;
                    agg.eventos++;
                    danoNoCaso = true;

                    if (Boolean.TRUE.equals(achado.getDanoPresenteAdmissao())) {
                        eventosPresentesAdmissao++;
                    } else {
                        eventosIntrahospitalares++;
                    }

                    String sev = achado.getGravidade() == null ? "CATEGORIA_E" : achado.getGravidade().name();
                    severidades.put(sev, severidades.getOrDefault(sev, 0) + 1);

                    if (achado.getGatilho() != null && achado.getGatilho().getModulo() != null) {
                        String mod = achado.getGatilho().getModulo().getCodigo().toUpperCase();
                        distribuicaoModulos.put(mod, distribuicaoModulos.getOrDefault(mod, 0) + 1);
                    }
                }
            }

            if (danoNoCaso) {
                casosComDano++;
            }
        }

        // Construção da série temporal ordenada para o Run Chart do IHI
        DateTimeFormatter rotuloFormatter = DateTimeFormatter.ofPattern("MM/yyyy");
        List<Map<String, Object>> serieTemporal = new ArrayList<>();
        List<Double> taxasPorMilHistorico = new ArrayList<>();
        List<Double> taxasPorCemHistorico = new ArrayList<>();

        for (Map.Entry<YearMonth, AgregadoTemporal> entry : agregadoTemporal.entrySet()) {
            YearMonth ym = entry.getKey();
            AgregadoTemporal agg = entry.getValue();
            double taxaMil = agg.dias == 0 ? 0.0 : Math.round((double) agg.eventos / agg.dias * 100000.0) / 100.0;
            double taxaCem = agg.prontuarios == 0 ? 0.0
                    : Math.round((double) agg.eventos / agg.prontuarios * 10000.0) / 100.0;

            taxasPorMilHistorico.add(taxaMil);
            taxasPorCemHistorico.add(taxaCem);

            Map<String, Object> ponto = new HashMap<>();
            ponto.put("periodo", ym.toString());
            ponto.put("rotulo", ym.format(rotuloFormatter));
            ponto.put("prontuarios", agg.prontuarios);
            ponto.put("dias", agg.dias);
            ponto.put("eventos", agg.eventos);
            ponto.put("taxaPorMilDias", taxaMil);
            ponto.put("taxaPorCemAdmissoes", taxaCem);
            serieTemporal.add(ponto);
        }

        double medianaTaxaMil = calcularMediana(taxasPorMilHistorico);
        double medianaTaxaCem = calcularMediana(taxasPorCemHistorico);

        // Eficácia de rastreamento dos gatilhos
        double taxaRendimentoGatilhos = totalGatilhosRastreados == 0 ? 0.0
                : Math.round((double) totalDanosConfirmadosGeral / totalGatilhosRastreados * 10000.0) / 100.0;

        double mediaPermanencia = revisoes.isEmpty() ? 0.0
                : Math.round((double) totalDias / revisoes.size() * 10.0) / 10.0;

        double percentualAdmissao = totalEventos == 0 ? 0.0
                : Math.round((double) eventosPresentesAdmissao / totalEventos * 10000.0) / 100.0;
        double percentualIntrahospitalar = totalEventos == 0 ? 0.0
                : Math.round((double) eventosIntrahospitalares / totalEventos * 10000.0) / 100.0;

        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("totalProntuariosRevistos", revisoes.size());
        resultado.put("totalDiasInternacao", totalDias);
        resultado.put("mediaPermanenciaDias", mediaPermanencia);
        resultado.put("totalEventosAdversos", totalEventos);
        resultado.put("eventosIntrahospitalares", eventosIntrahospitalares);
        resultado.put("eventosPresentesAdmissao", eventosPresentesAdmissao);
        resultado.put("percentualPresenteAdmissao", percentualAdmissao);
        resultado.put("percentualIntrahospitalar", percentualIntrahospitalar);
        resultado.put("prontuariosComDano", casosComDano);

        // As 3 Medidas Canônicas do White Paper do IHI
        resultado.put("taxaDanosPorMilDias",
                totalDias == 0 ? 0.0 : Math.round((double) totalEventos / totalDias * 100000.0) / 100.0);
        resultado.put("frequenciaPorCemAdmissoes",
                revisoes.isEmpty() ? 0.0 : Math.round((double) totalEventos / revisoes.size() * 10000.0) / 100.0);
        resultado.put("prevalenciaPercentual",
                revisoes.isEmpty() ? 0.0 : Math.round((double) casosComDano / revisoes.size() * 10000.0) / 100.0);

        resultado.put("distribuicaoSeveridade", severidades);
        resultado.put("distribuicaoModulos", distribuicaoModulos);
        resultado.put("serieTemporal", serieTemporal);
        resultado.put("medianaTaxaPorMilDias", medianaTaxaMil);
        resultado.put("medianaTaxaPorCemAdmissoes", medianaTaxaCem);

        Map<String, Object> eficacia = new HashMap<>();
        eficacia.put("totalGatilhosRastreados", totalGatilhosRastreados);
        eficacia.put("totalDanosConfirmados", totalDanosConfirmadosGeral);
        eficacia.put("taxaRendimentoGatilhos", taxaRendimentoGatilhos);
        resultado.put("eficaciaGatilhos", eficacia);

        return resultado;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obterQuadroResumo(Long turmaId, String periodoLetivo,
            Long cenarioId, Long unidadeId,
            LocalDate dataInicio, LocalDate dataFim,
            String moduloCodigo, String gravidade,
            Boolean danoPresenteAdmissao, Boolean apenasComDano,
            String busca, Integer pagina, Integer tamanho) {

        List<RevisaoIndividual> revisoes = filtrarRevisoesHomologadas(turmaId, periodoLetivo, cenarioId, unidadeId,
                dataInicio, dataFim);

        List<Map<String, Object>> itens = new ArrayList<>();
        int totalDiasGeral = 0;
        int totalEventosGeral = 0;
        int prontuariosComDanoGeral = 0;

        for (RevisaoIndividual rev : revisoes) {
            Integer ttp = rev.getProntuario().getTempoPermanenciaDias();
            int ttpValido = ttp != null && ttp > 0 ? ttp : 1;
            totalDiasGeral += ttpValido;

            List<AchadoGatilho> achadosBrutos = achadoRepositorio.findByRevisaoIndividualId(rev.getId());
            List<AchadoGatilho> achadosValidos = new ArrayList<>();
            List<String> codigosGatilhos = new ArrayList<>();
            List<String> descricoesDanos = new ArrayList<>();
            boolean possuiDano = false;
            boolean presenteAdmissao = false;
            GravidadeNccMerp gravidadeMaxima = null;

            for (AchadoGatilho achado : achadosBrutos) {
                if (achado.getGatilho() != null) {
                    codigosGatilhos.add(achado.getGatilho().getCodigo());
                }
                if (Boolean.TRUE.equals(achado.getConfirmouDano())) {
                    possuiDano = true;
                    achadosValidos.add(achado);
                    if (achado.getJustificativaDano() != null && !achado.getJustificativaDano().isBlank()) {
                        descricoesDanos.add(achado.getJustificativaDano());
                    } else if (achado.getGatilho() != null) {
                        descricoesDanos.add(achado.getGatilho().getDescricao());
                    }
                    if (Boolean.TRUE.equals(achado.getDanoPresenteAdmissao())) {
                        presenteAdmissao = true;
                    }
                    if (achado.getGravidade() != null) {
                        if (gravidadeMaxima == null || achado.getGravidade().ordinal() > gravidadeMaxima.ordinal()) {
                            gravidadeMaxima = achado.getGravidade();
                        }
                    }
                }
            }

            if (possuiDano) {
                prontuariosComDanoGeral++;
                totalEventosGeral += achadosValidos.size();
            }

            // Aplicar filtros específicos da visualização
            if (Boolean.TRUE.equals(apenasComDano) && !possuiDano) {
                continue;
            }

            if (gravidade != null && !gravidade.isBlank() && !gravidade.equalsIgnoreCase("TODOS")) {
                boolean bateGravidade = achadosValidos.stream()
                        .anyMatch(a -> a.getGravidade() != null && a.getGravidade().name().equalsIgnoreCase(gravidade));
                if (!bateGravidade)
                    continue;
            }

            if (moduloCodigo != null && !moduloCodigo.isBlank() && !moduloCodigo.equalsIgnoreCase("TODOS")) {
                boolean bateModulo = achadosBrutos.stream()
                        .anyMatch(a -> a.getGatilho() != null && a.getGatilho().getModulo() != null
                                && a.getGatilho().getModulo().getCodigo().equalsIgnoreCase(moduloCodigo));
                if (!bateModulo)
                    continue;
            }

            if (danoPresenteAdmissao != null) {
                boolean bateAdmissao = achadosValidos.stream()
                        .anyMatch(a -> Objects.equals(a.getDanoPresenteAdmissao(), danoPresenteAdmissao));
                if (!bateAdmissao)
                    continue;
            }

            if (busca != null && !busca.isBlank()) {
                String termo = busca.trim().toLowerCase();
                String num = rev.getProntuario().getNumeroAtendimento().toLowerCase();
                String unidade = rev.getProntuario().getUnidadeHospitalar().getNome().toLowerCase();
                String aluno = rev.getAluno().getNomeCompleto().toLowerCase();
                boolean achou = num.contains(termo) || unidade.contains(termo) || aluno.contains(termo)
                        || codigosGatilhos.stream().anyMatch(c -> c.toLowerCase().contains(termo))
                        || descricoesDanos.stream().anyMatch(d -> d.toLowerCase().contains(termo));
                if (!achou)
                    continue;
            }

            Optional<ValidacaoDocente> valOpt = validacaoRepositorio.findByRevisaoIndividualId(rev.getId());

            Map<String, Object> item = new HashMap<>();
            item.put("revisaoId", rev.getId());
            item.put("numeroAtendimento", rev.getProntuario().getNumeroAtendimento());
            item.put("idadePaciente", rev.getProntuario().getIdadePaciente());
            item.put("tempoPermanenciaDias", ttpValido);
            item.put("unidadeHospitalarNome", rev.getProntuario().getUnidadeHospitalar().getNome());
            item.put("unidadeHospitalarSigla", rev.getProntuario().getUnidadeHospitalar().getSigla());
            item.put("codigoDisciplina", rev.getAtividade().getTurma().getCodigoDisciplina());
            item.put("periodoLetivo", rev.getAtividade().getTurma().getPeriodoLetivo());
            item.put("alunoAuditorNome", rev.getAluno().getNomeCompleto());
            item.put("alunoMatricula", rev.getAluno().getMatriculaSigaa());
            item.put("dataAuditoria", rev.getDataSubmissao());
            item.put("professorValidadorNome",
                    valOpt.map(v -> v.getProfessorValidador().getNomeCompleto()).orElse("Docente"));
            item.put("nota", valOpt.map(ValidacaoDocente::getNota).orElse(null));
            item.put("totalGatilhos", codigosGatilhos.size());
            item.put("gatilhosDetectados", codigosGatilhos);
            item.put("totalDanos", achadosValidos.size());
            item.put("descricoesDanos", descricoesDanos);
            item.put("gravidadeMaxima", gravidadeMaxima != null ? gravidadeMaxima.name() : "NENHUM");
            item.put("danoPresenteAdmissao", presenteAdmissao);

            itens.add(item);
        }

        int totalFiltrados = itens.size();
        int page = (pagina != null && pagina >= 0) ? pagina : 0;
        int size = (tamanho != null && tamanho > 0) ? tamanho : 15;
        int inicio = Math.min(page * size, totalFiltrados);
        int fim = Math.min(inicio + size, totalFiltrados);
        List<Map<String, Object>> paginaItens = itens.subList(inicio, fim);

        Map<String, Object> resumoGeral = new HashMap<>();
        resumoGeral.put("totalProntuarios", revisoes.size());
        resumoGeral.put("totalDiasInternacao", totalDiasGeral);
        resumoGeral.put("totalEventosAdversos", totalEventosGeral);
        resumoGeral.put("prontuariosComDano", prontuariosComDanoGeral);
        resumoGeral.put("taxaDanosPorMilDias",
                totalDiasGeral == 0 ? 0.0 : Math.round((double) totalEventosGeral / totalDiasGeral * 100000.0) / 100.0);
        resumoGeral.put("frequenciaPorCemAdmissoes",
                revisoes.isEmpty() ? 0.0 : Math.round((double) totalEventosGeral / revisoes.size() * 10000.0) / 100.0);
        resumoGeral.put("prevalenciaPercentual",
                revisoes.isEmpty() ? 0.0
                        : Math.round((double) prontuariosComDanoGeral / revisoes.size() * 10000.0) / 100.0);

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("conteudo", paginaItens);
        resposta.put("paginaAtual", page);
        resposta.put("tamanhoPagina", size);
        resposta.put("totalElementos", totalFiltrados);
        resposta.put("totalPaginas", (int) Math.ceil((double) totalFiltrados / size));
        resposta.put("totais", resumoGeral);

        return resposta;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obterDesempenhoGatilhos(Long turmaId, String periodoLetivo,
            Long cenarioId, Long unidadeId,
            LocalDate dataInicio, LocalDate dataFim) {

        List<RevisaoIndividual> revisoes = filtrarRevisoesHomologadas(turmaId, periodoLetivo, cenarioId, unidadeId,
                dataInicio, dataFim);

        Map<Long, DesempenhoGatilhoAgregador> porGatilho = new HashMap<>();
        Map<String, DesempenhoModuloAgregador> porModulo = new LinkedHashMap<>();

        int totalPositivosGeral = 0;
        int totalDanosGeral = 0;

        for (RevisaoIndividual rev : revisoes) {
            List<AchadoGatilho> achados = achadoRepositorio.findByRevisaoIndividualId(rev.getId());
            for (AchadoGatilho achado : achados) {
                GatilhoGtt gatilho = achado.getGatilho();
                if (gatilho == null)
                    continue;

                totalPositivosGeral++;
                boolean dano = Boolean.TRUE.equals(achado.getConfirmouDano());
                if (dano) {
                    totalDanosGeral++;
                }

                String modCod = gatilho.getModulo() != null ? gatilho.getModulo().getCodigo().toUpperCase() : "OUTROS";
                String modNome = gatilho.getModulo() != null ? gatilho.getModulo().getNome() : "Outros";

                DesempenhoGatilhoAgregador gAgg = porGatilho.computeIfAbsent(gatilho.getId(),
                        k -> new DesempenhoGatilhoAgregador(gatilho.getId(), gatilho.getCodigo(),
                                gatilho.getDescricao(),
                                modCod, modNome));
                gAgg.positivos++;
                if (dano) {
                    gAgg.danos++;
                    if (achado.getGravidade() != null) {
                        String sev = achado.getGravidade().name();
                        gAgg.severidades.put(sev, gAgg.severidades.getOrDefault(sev, 0) + 1);
                        if (achado.getGravidade() == GravidadeNccMerp.CATEGORIA_G
                                || achado.getGravidade() == GravidadeNccMerp.CATEGORIA_H
                                || achado.getGravidade() == GravidadeNccMerp.CATEGORIA_I) {
                            gAgg.danosGraves++;
                        }
                    }
                    if (Boolean.TRUE.equals(achado.getDanoPresenteAdmissao())) {
                        gAgg.presentesAdmissao++;
                    }
                }

                DesempenhoModuloAgregador mAgg = porModulo.computeIfAbsent(modCod,
                        k -> new DesempenhoModuloAgregador(modCod, modNome));
                mAgg.positivos++;
                if (dano) {
                    mAgg.danos++;
                }
            }
        }

        List<Map<String, Object>> listaGatilhos = porGatilho.values().stream()
                .map(DesempenhoGatilhoAgregador::paraMapa)
                .sorted((a, b) -> {
                    int cDano = Integer.compare((Integer) b.get("totalDanos"), (Integer) a.get("totalDanos"));
                    if (cDano != 0)
                        return cDano;
                    return Integer.compare((Integer) b.get("totalPositivos"), (Integer) a.get("totalPositivos"));
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> listaModulos = porModulo.values().stream()
                .map(DesempenhoModuloAgregador::paraMapa)
                .sorted((a, b) -> Integer.compare((Integer) b.get("totalDanos"), (Integer) a.get("totalDanos")))
                .collect(Collectors.toList());

        double taxaConversaoGeral = totalPositivosGeral == 0 ? 0.0
                : Math.round((double) totalDanosGeral / totalPositivosGeral * 10000.0) / 100.0;

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("totalGatilhosRastreados", totalPositivosGeral);
        resultado.put("totalDanosConfirmados", totalDanosGeral);
        resultado.put("taxaConversaoGeral", taxaConversaoGeral);
        resultado.put("gatilhos", listaGatilhos);
        resultado.put("modulos", listaModulos);

        return resultado;
    }

    private List<RevisaoIndividual> filtrarRevisoesHomologadas(Long turmaId, String periodoLetivo,
            Long cenarioId, Long unidadeId,
            LocalDate dataInicio, LocalDate dataFim) {
        return revisaoRepositorio.findAll().stream()
                .filter(r -> r.getAtividade() != null && Boolean.TRUE.equals(r.getFinalizada()))
                .filter(r -> turmaId == null || r.getAtividade().getTurma().getId().equals(turmaId))
                .filter(r -> periodoLetivo == null || periodoLetivo.isBlank() || periodoLetivo.equalsIgnoreCase("TODOS")
                        || r.getAtividade().getTurma().getPeriodoLetivo().equalsIgnoreCase(periodoLetivo))
                .filter(r -> cenarioId == null || r.getAtividade().getCenario().getId().equals(cenarioId))
                .filter(r -> unidadeId == null || r.getProntuario().getUnidadeHospitalar().getId().equals(unidadeId))
                .filter(r -> dataInicio == null || !r.getAtividade().getDataInicio().toLocalDate().isBefore(dataInicio))
                .filter(r -> dataFim == null || !r.getAtividade().getDataInicio().toLocalDate().isAfter(dataFim))
                .filter(r -> validacaoRepositorio.findByRevisaoIndividualId(r.getId())
                        .map(v -> Boolean.TRUE.equals(v.getHomologado())).orElse(false))
                .toList();
    }

    private double calcularMediana(List<Double> valores) {
        if (valores == null || valores.isEmpty()) {
            return 0.0;
        }
        List<Double> ordenados = new ArrayList<>(valores);
        Collections.sort(ordenados);
        int meio = ordenados.size() / 2;
        if (ordenados.size() % 2 != 0) {
            return Math.round(ordenados.get(meio) * 10.0) / 10.0;
        } else {
            return Math.round(((ordenados.get(meio - 1) + ordenados.get(meio)) / 2.0) * 10.0) / 10.0;
        }
    }

    private static class AgregadoTemporal {
        int prontuarios = 0;
        int dias = 0;
        int eventos = 0;
    }

    private static class DesempenhoGatilhoAgregador {
        final Long id;
        final String codigo;
        final String descricao;
        final String moduloCodigo;
        final String moduloNome;
        int positivos = 0;
        int danos = 0;
        int danosGraves = 0;
        int presentesAdmissao = 0;
        final Map<String, Integer> severidades = new HashMap<>();

        DesempenhoGatilhoAgregador(Long id, String codigo, String descricao, String moduloCodigo, String moduloNome) {
            this.id = id;
            this.codigo = codigo;
            this.descricao = descricao;
            this.moduloCodigo = moduloCodigo;
            this.moduloNome = moduloNome;
        }

        Map<String, Object> paraMapa() {
            double tx = positivos == 0 ? 0.0 : Math.round((double) danos / positivos * 10000.0) / 100.0;
            Map<String, Object> m = new HashMap<>();
            m.put("gatilhoId", id);
            m.put("codigo", codigo);
            m.put("descricao", descricao);
            m.put("moduloCodigo", moduloCodigo);
            m.put("moduloNome", moduloNome);
            m.put("totalPositivos", positivos);
            m.put("totalDanos", danos);
            m.put("taxaConversaoPercentual", tx);
            m.put("danosGraves", danosGraves);
            m.put("presentesAdmissao", presentesAdmissao);
            m.put("distribuicaoSeveridade", severidades);
            return m;
        }
    }

    private static class DesempenhoModuloAgregador {
        final String codigo;
        final String nome;
        int positivos = 0;
        int danos = 0;

        DesempenhoModuloAgregador(String codigo, String nome) {
            this.codigo = codigo;
            this.nome = nome;
        }

        Map<String, Object> paraMapa() {
            double tx = positivos == 0 ? 0.0 : Math.round((double) danos / positivos * 10000.0) / 100.0;
            Map<String, Object> m = new HashMap<>();
            m.put("moduloCodigo", codigo);
            m.put("moduloNome", nome);
            m.put("totalPositivos", positivos);
            m.put("totalDanos", danos);
            m.put("taxaConversaoPercentual", tx);
            return m;
        }
    }
}
