package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.ConsensoDupla;
import br.ufs.dcomp.sigeagtt.modelos.ItemConsenso;
import br.ufs.dcomp.sigeagtt.modelos.ProntuarioSimulado;
import br.ufs.dcomp.sigeagtt.repositorios.ConsensoDuplaRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.ItemConsensoRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.ValidacaoDocenteRepositorio;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IndicadoresEpidemiologicosServico {

    private final ConsensoDuplaRepositorio consensoRepositorio;
    private final ValidacaoDocenteRepositorio validacaoDocenteRepositorio;
    private final ItemConsensoRepositorio itemConsensoRepositorio;

    public IndicadoresEpidemiologicosServico(ConsensoDuplaRepositorio consensoRepositorio,
                                             ValidacaoDocenteRepositorio validacaoDocenteRepositorio,
                                             ItemConsensoRepositorio itemConsensoRepositorio) {
        this.consensoRepositorio = consensoRepositorio;
        this.validacaoDocenteRepositorio = validacaoDocenteRepositorio;
        this.itemConsensoRepositorio = itemConsensoRepositorio;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> calcularIndicadores(Long turmaId) {
        List<ConsensoDupla> consensos = consensoRepositorio.findAll();

        // Filtra apenas consensos validados e homologados positivamente pelo docente
        List<ConsensoDupla> homologados = consensos.stream().filter(c -> {
            if (turmaId != null) {
                // Se houver filtro de turma, verifica se a atividade pertence à turma
                // (acessando via dupla -> atividade -> turma)
                Long tId = c.getDupla().getAtividade().getTurma().getId();
                if (!tId.equals(turmaId)) return false;
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
                if (Boolean.TRUE.equals(item.getConfirmouDano()) && !Boolean.TRUE.equals(item.getDanoPresenteAdmissao())) {
                    totalEventosAdversos++;
                    temDanoNoCaso = true;

                    String sev = item.getGravidadeHomologada() != null 
                            ? item.getGravidadeHomologada().name() 
                            : (item.getGravidadeConsenso() != null ? item.getGravidadeConsenso().name() : "CATEGORIA_E");
                    
                    distribuicaoSeveridade.put(sev, distribuicaoSeveridade.getOrDefault(sev, 0) + 1);
                }
            }

            if (temDanoNoCaso) {
                prontuariosComDano++;
            }
        }

        // Fórmulas IHI
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
