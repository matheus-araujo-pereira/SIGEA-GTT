package br.ufs.dcomp.sigeagtt.modulos.indicadores.servico;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.GravidadeNccMerp;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.StatusSubmissao;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.SubmissaoAtividade;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.SubmissaoGatilho;
import br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio.SubmissaoAtividadeRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio.SubmissaoGatilhoRepositorio;
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

    private final SubmissaoAtividadeRepositorio submissaoRepositorio;
    private final SubmissaoGatilhoRepositorio gatilhoAchadoRepositorio;

    public IndicadoresEpidemiologicosServico(
            SubmissaoAtividadeRepositorio submissaoRepositorio,
            SubmissaoGatilhoRepositorio gatilhoAchadoRepositorio) {
        this.submissaoRepositorio = submissaoRepositorio;
        this.gatilhoAchadoRepositorio = gatilhoAchadoRepositorio;
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

        List<SubmissaoAtividade> submissoes = filtrarSubmissoesAvaliadas(turmaId, periodoLetivo, cenarioId, unidadeId,
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

        for (SubmissaoAtividade sub : submissoes) {
            Integer dias = sub.getAtividade().getCasoClinico().getTempoPermanenciaDias();
            int diasValidos = dias != null && dias > 0 ? dias : 1;
            totalDias += diasValidos;

            LocalDate dataRef = sub.getDataSubmissao() != null ? sub.getDataSubmissao().toLocalDate()
                    : (sub.getAtividade().getDataInicio() != null
                            ? sub.getAtividade().getDataInicio().toLocalDate()
                            : LocalDate.now());
            YearMonth ym = YearMonth.from(dataRef);
            AgregadoTemporal agg = agregadoTemporal.computeIfAbsent(ym, k -> new AgregadoTemporal());
            agg.prontuarios++;
            agg.dias += diasValidos;

            List<SubmissaoGatilho> achados = gatilhoAchadoRepositorio.findBySubmissaoId(sub.getId());
            boolean danoNoCaso = false;

            for (SubmissaoGatilho achado : achados) {
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

                    if (achado.getGravidade() != null) {
                        String chaveSev = achado.getGravidade().name();
                        severidades.put(chaveSev, severidades.getOrDefault(chaveSev, 0) + 1);
                    }

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

        // Construir série temporal contínua com taxas oficiais IHI
        List<Map<String, Object>> serieTemporal = new ArrayList<>();
        List<Double> taxasPorMilHistorico = new ArrayList<>();
        List<Double> taxasPorCemHistorico = new ArrayList<>();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM/yy", Locale.forLanguageTag("pt-BR"));
        for (Map.Entry<YearMonth, AgregadoTemporal> entry : agregadoTemporal.entrySet()) {
            AgregadoTemporal agg = entry.getValue();
            double taxaMil = agg.dias == 0 ? 0.0 : ((double) agg.eventos / agg.dias) * 1000.0;
            double taxaCem = agg.prontuarios == 0 ? 0.0 : ((double) agg.eventos / agg.prontuarios) * 100.0;
            double taxaMilArr = Math.round(taxaMil * 10.0) / 10.0;
            double taxaCemArr = Math.round(taxaCem * 10.0) / 10.0;

            taxasPorMilHistorico.add(taxaMilArr);
            taxasPorCemHistorico.add(taxaCemArr);

            Map<String, Object> ponto = new HashMap<>();
            ponto.put("periodo", entry.getKey().format(fmt));
            ponto.put("anoMes", entry.getKey().toString());
            ponto.put("eventosAdversos", agg.eventos);
            ponto.put("totalDias", agg.dias);
            ponto.put("prontuariosAuditados", agg.prontuarios);
            ponto.put("taxaPorMilDias", taxaMilArr);
            ponto.put("taxaPorCemAdmissoes", taxaCemArr);
            serieTemporal.add(ponto);
        }

        double medianaTaxaMil = calcularMediana(taxasPorMilHistorico);
        double medianaTaxaCem = calcularMediana(taxasPorCemHistorico);

        for (Map<String, Object> ponto : serieTemporal) {
            ponto.put("medianaPorMilDias", medianaTaxaMil);
            ponto.put("medianaPorCemAdmissoes", medianaTaxaCem);
        }

        double taxaRendimentoGatilhos = totalGatilhosRastreados == 0 ? 0.0
                : Math.round((double) totalDanosConfirmadosGeral / totalGatilhosRastreados * 10000.0) / 100.0;

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("totalProntuariosAuditados", submissoes.size());
        resultado.put("totalDiasInternacao", totalDias);
        resultado.put("totalEventosAdversos", totalEventos);
        resultado.put("eventosIntrahospitalares", eventosIntrahospitalares);
        resultado.put("eventosPresentesAdmissao", eventosPresentesAdmissao);
        resultado.put("prontuariosComEventosAdversos", casosComDano);

        resultado.put("taxaDanosPorMilDias",
                totalDias == 0 ? 0.0 : Math.round((double) totalEventos / totalDias * 100000.0) / 100.0);
        resultado.put("frequenciaPorCemAdmissoes",
                submissoes.isEmpty() ? 0.0 : Math.round((double) totalEventos / submissoes.size() * 10000.0) / 100.0);
        resultado.put("prevalenciaPercentual",
                submissoes.isEmpty() ? 0.0 : Math.round((double) casosComDano / submissoes.size() * 10000.0) / 100.0);

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

        List<SubmissaoAtividade> submissoes = filtrarSubmissoesAvaliadas(turmaId, periodoLetivo, cenarioId, unidadeId,
                dataInicio, dataFim);

        List<Map<String, Object>> itens = new ArrayList<>();
        int totalDiasGeral = 0;
        int totalEventosGeral = 0;
        int prontuariosComDanoGeral = 0;

        for (SubmissaoAtividade sub : submissoes) {
            Integer ttp = sub.getAtividade().getCasoClinico().getTempoPermanenciaDias();
            int ttpValido = ttp != null && ttp > 0 ? ttp : 1;
            totalDiasGeral += ttpValido;

            List<SubmissaoGatilho> achadosBrutos = gatilhoAchadoRepositorio.findBySubmissaoId(sub.getId());
            List<SubmissaoGatilho> achadosValidos = new ArrayList<>();
            List<String> codigosGatilhos = new ArrayList<>();
            List<String> descricoesDanos = new ArrayList<>();
            boolean possuiDano = false;
            boolean presenteAdmissao = false;
            GravidadeNccMerp gravidadeMaxima = null;

            for (SubmissaoGatilho achado : achadosBrutos) {
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
                String num = sub.getAtividade().getCasoClinico().getNumeroAtendimento().toLowerCase();
                String unidade = sub.getAtividade().getCasoClinico().getUnidadeHospitalar().getNome().toLowerCase();
                String aluno = sub.getAluno().getNomeCompleto().toLowerCase();
                boolean achou = num.contains(termo) || unidade.contains(termo) || aluno.contains(termo)
                        || codigosGatilhos.stream().anyMatch(c -> c.toLowerCase().contains(termo))
                        || descricoesDanos.stream().anyMatch(d -> d.toLowerCase().contains(termo));
                if (!achou)
                    continue;
            }

            Map<String, Object> item = new HashMap<>();
            item.put("revisaoId", sub.getId());
            item.put("numeroAtendimento", sub.getAtividade().getCasoClinico().getNumeroAtendimento());
            item.put("idadePaciente", sub.getAtividade().getCasoClinico().getIdadePaciente());
            item.put("tempoPermanenciaDias", ttpValido);
            item.put("unidadeHospitalarNome", sub.getAtividade().getCasoClinico().getUnidadeHospitalar().getNome());
            item.put("unidadeHospitalarSigla", sub.getAtividade().getCasoClinico().getUnidadeHospitalar().getSigla());
            item.put("codigoDisciplina", sub.getAtividade().getTurma().getCodigoDisciplina());
            item.put("periodoLetivo", sub.getAtividade().getTurma().getPeriodoLetivo());
            item.put("alunoAuditorNome", sub.getAluno().getNomeCompleto());
            item.put("alunoMatricula", sub.getAluno().getMatriculaSigaa());
            item.put("dataAuditoria", sub.getDataSubmissao());
            item.put("professorValidadorNome",
                    sub.getProfessorCorretor() != null ? sub.getProfessorCorretor().getNomeCompleto() : "Docente");
            item.put("nota", sub.getNota());
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
        resumoGeral.put("totalProntuarios", submissoes.size());
        resumoGeral.put("totalDiasInternacao", totalDiasGeral);
        resumoGeral.put("totalEventosAdversos", totalEventosGeral);
        resumoGeral.put("prontuariosComDano", prontuariosComDanoGeral);
        resumoGeral.put("taxaDanosPorMilDias",
                totalDiasGeral == 0 ? 0.0 : Math.round((double) totalEventosGeral / totalDiasGeral * 100000.0) / 100.0);
        resumoGeral.put("frequenciaPorCemAdmissoes",
                submissoes.isEmpty() ? 0.0
                        : Math.round((double) totalEventosGeral / submissoes.size() * 10000.0) / 100.0);
        resumoGeral.put("prevalenciaPercentual",
                submissoes.isEmpty() ? 0.0
                        : Math.round((double) prontuariosComDanoGeral / submissoes.size() * 10000.0) / 100.0);

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

        List<SubmissaoAtividade> submissoes = filtrarSubmissoesAvaliadas(turmaId, periodoLetivo, cenarioId, unidadeId,
                dataInicio, dataFim);

        Map<Long, DesempenhoGatilhoAgregador> porGatilho = new HashMap<>();
        Map<String, DesempenhoModuloAgregador> porModulo = new LinkedHashMap<>();

        int totalPositivosGeral = 0;
        int totalDanosGeral = 0;

        for (SubmissaoAtividade sub : submissoes) {
            List<SubmissaoGatilho> achados = gatilhoAchadoRepositorio.findBySubmissaoId(sub.getId());
            for (SubmissaoGatilho achado : achados) {
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
                .map(agg -> agg.paraMapa())
                .sorted((a, b) -> {
                    int cDano = Integer.compare((Integer) b.get("totalDanos"), (Integer) a.get("totalDanos"));
                    if (cDano != 0)
                        return cDano;
                    return Integer.compare((Integer) b.get("totalPositivos"), (Integer) a.get("totalPositivos"));
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> listaModulos = porModulo.values().stream()
                .map(agg -> agg.paraMapa())
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

    private List<SubmissaoAtividade> filtrarSubmissoesAvaliadas(Long turmaId, String periodoLetivo,
            Long cenarioId, Long unidadeId,
            LocalDate dataInicio, LocalDate dataFim) {
        return submissaoRepositorio.findAll().stream()
                .filter(s -> s.getStatus() == StatusSubmissao.AVALIADA)
                .filter(s -> turmaId == null
                        || (s.getAtividade() != null && s.getAtividade().getTurma().getId().equals(turmaId)))
                .filter(s -> periodoLetivo == null || periodoLetivo.isBlank() || periodoLetivo.equalsIgnoreCase("TODOS")
                        || (s.getAtividade() != null
                                && s.getAtividade().getTurma().getPeriodoLetivo().equalsIgnoreCase(periodoLetivo)))
                .filter(s -> cenarioId == null
                        || (s.getAtividade() != null && s.getAtividade().getCasoClinico().getId().equals(cenarioId)))
                .filter(s -> unidadeId == null || (s.getAtividade() != null
                        && s.getAtividade().getCasoClinico().getUnidadeHospitalar().getId().equals(unidadeId)))
                .filter(s -> dataInicio == null || (s.getAtividade() != null
                        && !s.getAtividade().getDataInicio().toLocalDate().isBefore(dataInicio)))
                .filter(s -> dataFim == null || (s.getAtividade() != null
                        && !s.getAtividade().getDataInicio().toLocalDate().isAfter(dataFim)))
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
