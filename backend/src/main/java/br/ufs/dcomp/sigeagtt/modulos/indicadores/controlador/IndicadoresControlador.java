package br.ufs.dcomp.sigeagtt.modulos.indicadores.controlador;

import br.ufs.dcomp.sigeagtt.modulos.indicadores.servico.IndicadoresEpidemiologicosServico;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/indicadores")
public class IndicadoresControlador {

    private final IndicadoresEpidemiologicosServico servico;

    public IndicadoresControlador(IndicadoresEpidemiologicosServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> calcular(
            @RequestParam(required = false) Long turmaId,
            @RequestParam(required = false) String periodoLetivo,
            @RequestParam(required = false) Long cenarioId,
            @RequestParam(required = false) Long unidadeId,
            @RequestParam(required = false) LocalDate dataInicio,
            @RequestParam(required = false) LocalDate dataFim,
            @RequestParam(required = false) String moduloCodigo,
            @RequestParam(required = false) String gravidade,
            @RequestParam(required = false) Boolean danoPresenteAdmissao) {
        return ResponseEntity.ok(
                servico.calcularIndicadoresIndividuais(
                        turmaId,
                        periodoLetivo,
                        cenarioId,
                        unidadeId,
                        dataInicio,
                        dataFim,
                        moduloCodigo,
                        gravidade,
                        danoPresenteAdmissao));
    }

    @GetMapping("/quadro-resumo")
    public ResponseEntity<Map<String, Object>> obterQuadroResumo(
            @RequestParam(required = false) Long turmaId,
            @RequestParam(required = false) String periodoLetivo,
            @RequestParam(required = false) Long cenarioId,
            @RequestParam(required = false) Long unidadeId,
            @RequestParam(required = false) LocalDate dataInicio,
            @RequestParam(required = false) LocalDate dataFim,
            @RequestParam(required = false) String moduloCodigo,
            @RequestParam(required = false) String gravidade,
            @RequestParam(required = false) Boolean danoPresenteAdmissao,
            @RequestParam(required = false) Boolean apenasComDano,
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "0") Integer pagina,
            @RequestParam(defaultValue = "15") Integer tamanho) {
        return ResponseEntity.ok(
                servico.obterQuadroResumo(
                        turmaId,
                        periodoLetivo,
                        cenarioId,
                        unidadeId,
                        dataInicio,
                        dataFim,
                        moduloCodigo,
                        gravidade,
                        danoPresenteAdmissao,
                        apenasComDano,
                        busca,
                        pagina,
                        tamanho));
    }

    @GetMapping("/gatilhos")
    public ResponseEntity<Map<String, Object>> obterDesempenhoGatilhos(
            @RequestParam(required = false) Long turmaId,
            @RequestParam(required = false) String periodoLetivo,
            @RequestParam(required = false) Long cenarioId,
            @RequestParam(required = false) Long unidadeId,
            @RequestParam(required = false) LocalDate dataInicio,
            @RequestParam(required = false) LocalDate dataFim) {
        return ResponseEntity.ok(
                servico.obterDesempenhoGatilhos(
                        turmaId, periodoLetivo, cenarioId, unidadeId, dataInicio, dataFim));
    }
}
