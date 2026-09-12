package br.ufs.dcomp.sigeagtt.modulos.indicadores.servico;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.*;
import br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio.SubmissaoAtividadeRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio.SubmissaoGatilhoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.gtt.modelo.GatilhoGtt;
import br.ufs.dcomp.sigeagtt.modulos.gtt.modelo.ModuloGtt;
import br.ufs.dcomp.sigeagtt.modulos.turma.modelo.Turma;
import br.ufs.dcomp.sigeagtt.modulos.unidade.modelo.UnidadeHospitalar;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IndicadoresEpidemiologicosServicoTest {

    @Mock
    private SubmissaoAtividadeRepositorio submissaoRepositorio;

    @Mock
    private SubmissaoGatilhoRepositorio gatilhoAchadoRepositorio;

    @InjectMocks
    private IndicadoresEpidemiologicosServico servico;

    private Turma turma;
    private CasoClinico casoClinico;
    private UnidadeHospitalar unidade;
    private AtividadeEducacional atividade;
    private ModuloGtt moduloCuidados;
    private GatilhoGtt gatilhoC1;
    private Usuario professor;

    @BeforeEach
    void setUp() {
        professor = new Usuario();
        professor.setId(1L);
        professor.setNomeCompleto("Prof. Doutor");
        professor.setPerfil(PerfilUsuario.PROFESSOR);

        turma = new Turma();
        turma.setId(10L);
        turma.setPeriodoLetivo("2026.1");
        turma.setCodigoDisciplina("MED001");
        turma.setProfessorResponsavel(professor);

        unidade = new UnidadeHospitalar();
        unidade.setId(30L);
        unidade.setNome("UTI Adulto");
        unidade.setSigla("UTI-A");

        casoClinico = new CasoClinico();
        casoClinico.setId(20L);
        casoClinico.setTitulo("Caso de Teste");
        casoClinico.setUnidadeHospitalar(unidade);
        casoClinico.setTempoPermanenciaDias(5);
        casoClinico.setNumeroAtendimento("PRT-001");
        casoClinico.setIdadePaciente(45);

        atividade = new AtividadeEducacional();
        atividade.setId(40L);
        atividade.setTurma(turma);
        atividade.setCasoClinico(casoClinico);
        atividade.setDataInicio(LocalDateTime.now().minusDays(2));
        atividade.setDataFim(LocalDateTime.now().plusDays(2));

        moduloCuidados = new ModuloGtt();
        moduloCuidados.setId(1L);
        moduloCuidados.setCodigo("CUIDADOS");
        moduloCuidados.setNome("Módulo Cuidados");

        gatilhoC1 = new GatilhoGtt();
        gatilhoC1.setId(101L);
        gatilhoC1.setCodigo("C1");
        gatilhoC1.setDescricao("Transfusão de sangue");
        gatilhoC1.setModulo(moduloCuidados);
    }

    private SubmissaoAtividade criarSubmissao(Long id, int diasInternacao) {
        Usuario aluno = new Usuario();
        aluno.setId(id + 10);
        aluno.setNomeCompleto("Aluno Teste " + id);
        aluno.setMatriculaSigaa("20260000000" + id);

        CasoClinico caso = new CasoClinico();
        caso.setId(id * 100);
        caso.setNumeroAtendimento("PRT-00" + id);
        caso.setIdadePaciente(45);
        caso.setTempoPermanenciaDias(diasInternacao);
        caso.setUnidadeHospitalar(unidade);

        AtividadeEducacional atv = new AtividadeEducacional();
        atv.setId(atividade.getId());
        atv.setTurma(turma);
        atv.setCasoClinico(caso);
        atv.setDataInicio(atividade.getDataInicio());
        atv.setDataFim(atividade.getDataFim());

        SubmissaoAtividade sub = new SubmissaoAtividade();
        sub.setId(id);
        sub.setAtividade(atv);
        sub.setAluno(aluno);
        sub.setStatus(StatusSubmissao.AVALIADA);
        sub.setDataSubmissao(LocalDateTime.now());
        sub.setProfessorCorretor(professor);
        sub.setNota(BigDecimal.valueOf(9.0));
        return sub;
    }

    private SubmissaoGatilho criarAchado(Long id, SubmissaoAtividade sub, GatilhoGtt gat, boolean confirmouDano,
            GravidadeNccMerp gravidade) {
        SubmissaoGatilho a = new SubmissaoGatilho();
        a.setId(id);
        a.setSubmissao(sub);
        a.setGatilho(gat);
        a.setConfirmouDano(confirmouDano);
        a.setGravidade(gravidade);
        a.setDanoPresenteAdmissao(false);
        a.setJustificativaDano("Dano teste " + id);
        return a;
    }

    @Test
    @DisplayName("Deve calcular taxas IHI (1.000 dias, 100 admissões e prevalência) corretamente")
    void deveCalcularTaxasIhiCorretamente() {
        SubmissaoAtividade rev1 = criarSubmissao(1L, 10);
        SubmissaoAtividade rev2 = criarSubmissao(2L, 15);
        when(submissaoRepositorio.findAll()).thenReturn(List.of(rev1, rev2));

        SubmissaoGatilho achado1 = criarAchado(1L, rev1, gatilhoC1, true, GravidadeNccMerp.CATEGORIA_E);
        SubmissaoGatilho achado2 = criarAchado(2L, rev1, gatilhoC1, true, GravidadeNccMerp.CATEGORIA_F);
        when(gatilhoAchadoRepositorio.findBySubmissaoId(1L)).thenReturn(List.of(achado1, achado2));

        SubmissaoGatilho achado3 = criarAchado(3L, rev2, gatilhoC1, false, null);
        when(gatilhoAchadoRepositorio.findBySubmissaoId(2L)).thenReturn(List.of(achado3));

        Map<String, Object> resultado = servico.calcularIndicadoresIndividuais(null, null, null, null, null, null);

        assertNotNull(resultado);
        assertEquals(2, resultado.get("totalProntuariosAuditados"));
        assertEquals(25, resultado.get("totalDiasInternacao"));
        assertEquals(2, resultado.get("totalEventosAdversos"));
        assertEquals(1, resultado.get("prontuariosComEventosAdversos"));

        assertEquals(80.0, resultado.get("taxaDanosPorMilDias"));
        assertEquals(100.0, resultado.get("frequenciaPorCemAdmissoes"));
        assertEquals(50.0, resultado.get("prevalenciaPercentual"));
    }

    @Test
    @DisplayName("Deve retornar quadro resumo paginado e com totais corretos")
    void deveRetornarQuadroResumoComTotais() {
        SubmissaoAtividade rev1 = criarSubmissao(1L, 10);
        when(submissaoRepositorio.findAll()).thenReturn(List.of(rev1));

        SubmissaoGatilho achado1 = criarAchado(1L, rev1, gatilhoC1, true, GravidadeNccMerp.CATEGORIA_E);
        when(gatilhoAchadoRepositorio.findBySubmissaoId(1L)).thenReturn(List.of(achado1));

        Map<String, Object> resumo = servico.obterQuadroResumo(null, null, null, null, null, null, null, null, null,
                null, null, 0, 10);

        assertNotNull(resumo);
        List<?> conteudo = (List<?>) resumo.get("conteudo");
        assertEquals(1, conteudo.size());

        Map<?, ?> totais = (Map<?, ?>) resumo.get("totais");
        assertEquals(1, totais.get("totalProntuarios"));
        assertEquals(10, totais.get("totalDiasInternacao"));
        assertEquals(1, totais.get("totalEventosAdversos"));
    }

    @Test
    @DisplayName("Deve calcular rastreabilidade e rendimento diagnóstico de gatilhos")
    void deveCalcularDesempenhoGatilhos() {
        SubmissaoAtividade rev1 = criarSubmissao(1L, 10);
        when(submissaoRepositorio.findAll()).thenReturn(List.of(rev1));

        SubmissaoGatilho achado1 = criarAchado(1L, rev1, gatilhoC1, true, GravidadeNccMerp.CATEGORIA_E);
        when(gatilhoAchadoRepositorio.findBySubmissaoId(1L)).thenReturn(List.of(achado1));

        Map<String, Object> desempenho = servico.obterDesempenhoGatilhos(null, null, null, null, null, null);

        assertNotNull(desempenho);
        assertEquals(1, desempenho.get("totalGatilhosRastreados"));
        assertEquals(1, desempenho.get("totalDanosConfirmados"));
        assertEquals(100.0, desempenho.get("taxaConversaoGeral"));

        List<?> gatilhos = (List<?>) desempenho.get("gatilhos");
        assertEquals(1, gatilhos.size());
    }

    @Test
    @DisplayName("Deve retornar vazio quando nenhuma submissão avaliada for encontrada")
    void deveRetornarVazioQuandoNaoHouverRevisoes() {
        when(submissaoRepositorio.findAll()).thenReturn(List.of());

        Map<String, Object> resultado = servico.calcularIndicadoresIndividuais(null, null, null, null, null, null);

        assertNotNull(resultado);
        assertEquals(0, resultado.get("totalProntuariosAuditados"));
        assertEquals(0, resultado.get("totalDiasInternacao"));
        assertEquals(0, resultado.get("totalEventosAdversos"));
        assertEquals(0.0, resultado.get("taxaDanosPorMilDias"));
        assertEquals(0.0, resultado.get("frequenciaPorCemAdmissoes"));
        assertEquals(0.0, resultado.get("prevalenciaPercentual"));
    }
}
