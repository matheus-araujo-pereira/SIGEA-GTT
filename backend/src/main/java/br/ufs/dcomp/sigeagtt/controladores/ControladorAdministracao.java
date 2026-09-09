package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.configuracoes.CargaDadosSimuladosRunner;
import br.ufs.dcomp.sigeagtt.repositorios.TurmaRepositorio;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/administracao")
public class ControladorAdministracao {

    private final CargaDadosSimuladosRunner runner;
    private final TurmaRepositorio turmaRepositorio;

    public ControladorAdministracao(CargaDadosSimuladosRunner runner, TurmaRepositorio turmaRepositorio) {
        this.runner = runner;
        this.turmaRepositorio = turmaRepositorio;
    }

    @PostMapping("/carregar-dados-simulados")
    public ResponseEntity<Map<String, Object>> carregarDadosSimulados() {
        runner.executarScriptV3();
        long totalTurmas = turmaRepositorio.count();
        return ResponseEntity.ok(Map.of(
                "mensagem", "Carga de dados simulados executada com sucesso!",
                "totalTurmas", totalTurmas
        ));
    }
}
