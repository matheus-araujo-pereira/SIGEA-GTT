package br.ufs.dcomp.sigeagtt.modulos.indicadores.servico;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.AchadoGatilho;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.AtividadeAuditoria;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.GravidadeNccMerp;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.RevisaoIndividual;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.ValidacaoDocente;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.AchadoGatilhoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.RevisaoIndividualRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.ValidacaoDocenteRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.cenario.modelo.CenarioClinico;
import br.ufs.dcomp.sigeagtt.modulos.cenario.modelo.ProntuarioSimulado;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IndicadoresEpidemiologicosServicoTest {

    @Mock
    private RevisaoIndividualRepositorio revisaoRepositorio;

    @Mock
    private AchadoGatilhoRepositorio achadoRepositorio;

    @Mock
    private ValidacaoDocenteRepositorio validacaoRepositorio;

    @InjectMocks
    private IndicadoresEpidemiologicosServico servico;

    private Turma turma;
    private CenarioClinico cenario;
    private UnidadeHospitalar unidade;
    private AtividadeAuditoria atividade;
    private ModuloGtt moduloCuidados;
    private GatilhoGtt gatilhoC1;

    @BeforeEach
    void setUp() {
        Usuario professor = new Usuario();
        professor.setId(1L);
        professor.setNomeCompleto("Prof. Doutor");
        professor.setPerfil(PerfilUsuario.PROFESSOR);

        turma = new Turma();
        turma.setId(10L);
        turma.setPeriodoLetivo("2026.1");
        turma.setCodigoDisciplina("MED001");
        turma.setProfessorResponsavel(professor);

        cenario = new CenarioClinico();
        cenario.setId(20L);
        cenario.setTitulo("Cenário de Teste");

        unidade = new UnidadeHospitalar();
        unidade.setId(30L);
        unidade.setNome("UTI Adulto");
        unidade.setSigla("UTI-A");

        atividade = new AtividadeAuditoria();
        atividade.setId(40L);
        atividade.setTurma(turma);
        atividade.setCenario(cenario);
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

    private RevisaoIndividual criarRevisao(Long id, int diasInternacao) {
        Usuario aluno = new Usuario();
        aluno.setId(id + 10);
        aluno.setNomeCompleto("Aluno Teste " + id);
        aluno.setMatriculaSigaa("20260000000" + id);

        ProntuarioSimulado prontuario = new ProntuarioSimulado();
        prontuario.setId(id * 100);
        prontuario.setNumeroAtendimento("PRT-00" + id);
        prontuario.setIdadePaciente(45);
        prontuario.setTempoPermanenciaDias(diasInternacao);
        prontuario.setUnidadeHospitalar(unidade);

        RevisaoIndividual revisao = new RevisaoIndividual();
        revisao.setId(id);
        revisao.setAtividade(atividade);
        revisao.setAluno(aluno);
        revisao.setProntuario(prontuario);
        revisao.setFinalizada(true);
        revisao.setDataSubmissao(LocalDateTime.now());
        return revisao;
    }

    @Test
    @DisplayName("Deve retornar métricas zeradas quando não houver revisões homologadas")
    void deveRetornarZerosQuandoSemRevisoes() {
        when(revisaoRepositorio.findAll()).thenReturn(List.of());

        Map<String, Object> indicadores = servico.calcularIndicadoresIndividuais(
                null, null, null, null, null, null);

        assertEquals(0, indicadores.get("totalProntuariosRevistos"));
        assertEquals(0, indicadores.get("totalDiasInternacao"));
        assertEquals(0, indicadores.get("totalEventosAdversos"));
        assertEquals(0, indicadores.get("prontuariosComDano"));
    }

    @Test
    @DisplayName("Deve calcular corretamente os indicadores IHI-GTT para revisões homologadas incluindo presentes na admissao")
    void deveCalcularIndicadoresComSucesso() {
        RevisaoIndividual rev1 = criarRevisao(1L, 10);
        RevisaoIndividual rev2 = criarRevisao(2L, 15);

        when(revisaoRepositorio.findAll()).thenReturn(List.of(rev1, rev2));

        // Ambas homologadas
        ValidacaoDocente val1 = new ValidacaoDocente();
        val1.setHomologado(true);
        ValidacaoDocente val2 = new ValidacaoDocente();
        val2.setHomologado(true);

        when(validacaoRepositorio.findByRevisaoIndividualId(1L)).thenReturn(Optional.of(val1));
        when(validacaoRepositorio.findByRevisaoIndividualId(2L)).thenReturn(Optional.of(val2));

        // Rev 1 tem 1 evento adverso intrahospitalar categoria E
        AchadoGatilho achado1 = new AchadoGatilho();
        achado1.setGatilho(gatilhoC1);
        achado1.setConfirmouDano(true);
        achado1.setDanoPresenteAdmissao(false);
        achado1.setGravidade(GravidadeNccMerp.CATEGORIA_E);
        when(achadoRepositorio.findByRevisaoIndividualId(1L)).thenReturn(List.of(achado1));

        // Rev 2 tem 1 evento adverso presente na admissao categoria F
        AchadoGatilho achado2 = new AchadoGatilho();
        achado2.setGatilho(gatilhoC1);
        achado2.setConfirmouDano(true);
        achado2.setDanoPresenteAdmissao(true);
        achado2.setGravidade(GravidadeNccMerp.CATEGORIA_F);
        when(achadoRepositorio.findByRevisaoIndividualId(2L)).thenReturn(List.of(achado2));

        Map<String, Object> indicadores = servico.calcularIndicadoresIndividuais(
                null, null, null, null, null, null);

        assertEquals(2, indicadores.get("totalProntuariosRevistos"));
        assertEquals(25, indicadores.get("totalDiasInternacao"));
        // Ambos os eventos (intra e na admissão) contam no total canônico do IHI!
        assertEquals(2, indicadores.get("totalEventosAdversos"));
        assertEquals(1, indicadores.get("eventosIntrahospitalares"));
        assertEquals(1, indicadores.get("eventosPresentesAdmissao"));
        assertEquals(2, indicadores.get("prontuariosComDano"));

        // Taxa de Danos por 1000 dias: (2 / 25) * 1000 = 80.0
        assertEquals(80.0, indicadores.get("taxaDanosPorMilDias"));
        // Frequência por 100 admissões: (2 / 2) * 100 = 100.0%
        assertEquals(100.0, indicadores.get("frequenciaPorCemAdmissoes"));
        // Prevalência percentual: (2 / 2) * 100 = 100.0%
        assertEquals(100.0, indicadores.get("prevalenciaPercentual"));

        assertNotNull(indicadores.get("serieTemporal"));
        assertNotNull(indicadores.get("distribuicaoModulos"));
    }

    @Test
    @DisplayName("Deve gerar Quadro Resumo do Apêndice C com totais corretos")
    void deveGerarQuadroResumoComSucesso() {
        RevisaoIndividual rev1 = criarRevisao(1L, 5);
        when(revisaoRepositorio.findAll()).thenReturn(List.of(rev1));

        ValidacaoDocente val1 = new ValidacaoDocente();
        val1.setHomologado(true);
        Usuario prof = new Usuario();
        prof.setNomeCompleto("Professor Validador");
        val1.setProfessorValidador(prof);
        when(validacaoRepositorio.findByRevisaoIndividualId(1L)).thenReturn(Optional.of(val1));

        AchadoGatilho achado1 = new AchadoGatilho();
        achado1.setGatilho(gatilhoC1);
        achado1.setConfirmouDano(true);
        achado1.setJustificativaDano("Hemorragia pós-operatória");
        achado1.setDanoPresenteAdmissao(false);
        achado1.setGravidade(GravidadeNccMerp.CATEGORIA_F);
        when(achadoRepositorio.findByRevisaoIndividualId(1L)).thenReturn(List.of(achado1));

        Map<String, Object> resumo = servico.obterQuadroResumo(null, null, null, null, null, null, null, null, null,
                false, null, 0, 10);

        assertNotNull(resumo.get("conteudo"));
        List<?> conteudo = (List<?>) resumo.get("conteudo");
        assertEquals(1, conteudo.size());

        Map<?, ?> totais = (Map<?, ?>) resumo.get("totais");
        assertEquals(1, totais.get("totalProntuarios"));
        assertEquals(5, totais.get("totalDiasInternacao"));
        assertEquals(1, totais.get("totalEventosAdversos"));
    }

    @Test
    @DisplayName("Deve calcular desempenho de gatilhos e taxa de conversão")
    void deveCalcularDesempenhoGatilhos() {
        RevisaoIndividual rev1 = criarRevisao(1L, 4);
        when(revisaoRepositorio.findAll()).thenReturn(List.of(rev1));

        ValidacaoDocente val1 = new ValidacaoDocente();
        val1.setHomologado(true);
        when(validacaoRepositorio.findByRevisaoIndividualId(1L)).thenReturn(Optional.of(val1));

        AchadoGatilho achado1 = new AchadoGatilho();
        achado1.setGatilho(gatilhoC1);
        achado1.setConfirmouDano(true);
        achado1.setGravidade(GravidadeNccMerp.CATEGORIA_G);
        when(achadoRepositorio.findByRevisaoIndividualId(1L)).thenReturn(List.of(achado1));

        Map<String, Object> desempenho = servico.obterDesempenhoGatilhos(null, null, null, null, null, null);
        assertEquals(1, desempenho.get("totalGatilhosRastreados"));
        assertEquals(1, desempenho.get("totalDanosConfirmados"));
        assertEquals(100.0, desempenho.get("taxaConversaoGeral"));

        List<?> gatilhos = (List<?>) desempenho.get("gatilhos");
        assertTrue(!gatilhos.isEmpty());
    }
}
