package br.ufs.dcomp.sigeagtt.configuracoes;

import br.ufs.dcomp.sigeagtt.repositorios.TurmaRepositorio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;

@Component
public class CargaDadosSimuladosRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CargaDadosSimuladosRunner.class);

    private final TurmaRepositorio turmaRepositorio;
    private final JdbcTemplate jdbcTemplate;

    public CargaDadosSimuladosRunner(TurmaRepositorio turmaRepositorio, JdbcTemplate jdbcTemplate) {
        this.turmaRepositorio = turmaRepositorio;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            // Verifica se a tabela turmas existe e se já possui registros.
            // As migrações V1 e V2 são gerenciadas 100% pelo Flyway.
            long totalTurmas = turmaRepositorio.count();
            if (totalTurmas == 0) {
                log.info(
                        "Nenhuma turma encontrada na base de dados. Executando carga simulada do V3__dml_simulado.sql...");
                executarScriptV3();
                log.info("Carga simulada executada com sucesso! Total de turmas agora: {}", turmaRepositorio.count());
            } else {
                log.info("Base de dados já possui {} turma(s) cadastrada(s). Carga simulada dispensada.", totalTurmas);
            }
        } catch (Exception e) {
            log.warn("Aviso na checagem de dados iniciais: {}", e.getMessage());
        }
    }

    public synchronized void executarScriptV3() {
        executarScript("db/migration/V3__dml_simulado.sql");
    }

    public synchronized void executarScript(String caminhoClasspath) {
        try {
            ClassPathResource resource = new ClassPathResource(caminhoClasspath);
            String sql = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            jdbcTemplate.execute(sql);
            log.info("Script {} executado com sucesso via JdbcTemplate!", caminhoClasspath);
        } catch (Exception e) {
            log.error("Falha ao executar script {}: {}", caminhoClasspath, e.getMessage(), e);
            throw new RuntimeException("Falha ao executar script " + caminhoClasspath + ": " + e.getMessage(), e);
        }
    }
}
