package br.ufs.dcomp.sigeagtt;

import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {"spring.flyway.enabled=false"})
class SigeaGttBackendApplicationTests {

    @MockitoBean private DataSource dataSource;

    @Test
    void contextLoads() {}
}
