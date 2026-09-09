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
            // 1. Verifica se a tabela usuarios existe. Se nao existir, executa V1 (DDL) e V2 (DML base)
            Integer countUsuarios = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios'",
                    Integer.class);

            if (countUsuarios == null || countUsuarios == 0) {
                log.info("Tabela usuarios nao localizada. Executando V1__ddl.sql e V2__dml.sql...");
                executarScript("db/migration/V1__ddl.sql");
                executarScript("db/migration/V2__dml.sql");
                log.info("V1 e V2 executados com sucesso!");
            }

            // 2. Verifica se a tabela turmas existe e tem registros
            Integer countTurmas = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'turmas'",
                    Integer.class);

            if (countTurmas != null && countTurmas > 0) {
                long totalTurmas = turmaRepositorio.count();
                if (totalTurmas == 0) {
                    log.info("Nenhuma turma encontrada na base de dados. Executando carga simulada do V3__dml_simulado.sql...");
                    executarScriptV3();
                    log.info("Carga simulada executada com sucesso! Total de turmas agora: {}", turmaRepositorio.count());
                } else {
                    log.info("Base de dados ja possui {} turma(s) cadastrada(s). Carga simulada nao necessaria na inicializacao.", totalTurmas);
                }
            }
        } catch (Exception e) {
            log.error("Erro ao verificar/executar carga de dados na inicializacao: {}", e.getMessage(), e);
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
