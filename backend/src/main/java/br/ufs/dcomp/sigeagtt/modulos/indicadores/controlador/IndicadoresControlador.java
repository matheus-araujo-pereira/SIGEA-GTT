package br.ufs.dcomp.sigeagtt.modulos.indicadores.controlador;

import br.ufs.dcomp.sigeagtt.modulos.indicadores.servico.IndicadoresEpidemiologicosServico;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.time.LocalDate;

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
            @RequestParam(required = false) LocalDate dataFim) {
        return ResponseEntity.ok(servico.calcularIndicadoresIndividuais(
                turmaId, periodoLetivo, cenarioId, unidadeId, dataInicio, dataFim));
    }
}
