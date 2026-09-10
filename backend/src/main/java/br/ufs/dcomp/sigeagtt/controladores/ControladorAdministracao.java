package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.configuracoes.CargaDadosSimuladosRunner;
import br.ufs.dcomp.sigeagtt.repositorios.TurmaRepositorio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/administracao")
public class ControladorAdministracao {

    private static final Logger log = LoggerFactory.getLogger(ControladorAdministracao.class);

    private final CargaDadosSimuladosRunner runner;
    private final TurmaRepositorio turmaRepositorio;

    public ControladorAdministracao(CargaDadosSimuladosRunner runner, TurmaRepositorio turmaRepositorio) {
        this.runner = runner;
        this.turmaRepositorio = turmaRepositorio;
    }

    @PostMapping("/carregar-dados-simulados")
    public ResponseEntity<Map<String, Object>> carregarDadosSimulados() {
        try {
            log.info("Iniciando carga de dados simulados via endpoint /api/administracao/carregar-dados-simulados...");
            runner.executarScriptV3();
            long totalTurmas = turmaRepositorio.count();
            log.info("Carga de dados simulados finalizada com sucesso! Total de turmas agora: {}", totalTurmas);
            return ResponseEntity.ok(Map.of(
                    "status", "sucesso",
                    "mensagem", "Carga de dados simulados executada com sucesso!",
                    "totalTurmas", totalTurmas
            ));
        } catch (Exception e) {
            log.error("Falha ao executar carga de dados simulados: {}", e.getMessage(), e);
            Throwable root = e;
            while (root.getCause() != null) {
                root = root.getCause();
            }
            return ResponseEntity.status(500).body(Map.of(
                    "status", "erro",
                    "mensagem", e.getMessage() != null ? e.getMessage() : "Erro desconhecido",
                    "causaRaiz", root.getMessage() != null ? root.getMessage() : "Causa desconhecida"
            ));
        }
    }
}
