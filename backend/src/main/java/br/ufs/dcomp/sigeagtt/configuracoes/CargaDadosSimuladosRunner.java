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
            long totalTurmas = turmaRepositorio.count();
            if (totalTurmas == 0) {
                log.info("Nenhuma turma encontrada na base de dados. Executando carga simulada do V3__dml_simulado.sql...");
                executarScriptV3();
                log.info("Carga simulada executada com sucesso! Total de turmas agora: {}", turmaRepositorio.count());
            } else {
                log.info("Base de dados ja possui {} turma(s) cadastrada(s). Carga simulada nao necessaria na inicializacao.", totalTurmas);
            }
        } catch (Exception e) {
            log.error("Erro ao verificar/executar carga simulada na inicializacao: {}", e.getMessage(), e);
        }
    }

    public synchronized void executarScriptV3() {
        try {
            ClassPathResource resource = new ClassPathResource("db/migration/V3__dml_simulado.sql");
            String sql = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            jdbcTemplate.execute(sql);
            log.info("Script V3__dml_simulado.sql executado via JdbcTemplate com sucesso!");
        } catch (Exception e) {
            log.error("Falha ao executar script V3__dml_simulado.sql: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao executar carga simulada: " + e.getMessage(), e);
        }
    }
}
