package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.*;
import br.ufs.dcomp.sigeagtt.repositorios.AchadoGatilhoRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.RevisaoIndividualRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.ValidacaoDocenteRepositorio;
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

    @BeforeEach
    void setUp() {
        Usuario professor = new Usuario();
        professor.setId(1L);
        professor.setPerfil(PerfilUsuario.PROFESSOR);

        turma = new Turma();
        turma.setId(10L);
        turma.setPeriodoLetivo("2026.1");
        turma.setProfessorResponsavel(professor);

        cenario = new CenarioClinico();
        cenario.setId(20L);
        cenario.setTitulo("Cenário de Teste");

        unidade = new UnidadeHospitalar();
        unidade.setId(30L);
        unidade.setNome("UTI Adulto");

        atividade = new AtividadeAuditoria();
        atividade.setId(40L);
        atividade.setTurma(turma);
        atividade.setCenario(cenario);
        atividade.setDataInicio(LocalDateTime.now().minusDays(2));
        atividade.setDataFim(LocalDateTime.now().plusDays(2));
    }

    private RevisaoIndividual criarRevisao(Long id, int diasInternacao) {
        ProntuarioSimulado prontuario = new ProntuarioSimulado();
        prontuario.setId(id * 100);
        prontuario.setTempoPermanenciaDias(diasInternacao);
        prontuario.setUnidadeHospitalar(unidade);

        RevisaoIndividual revisao = new RevisaoIndividual();
        revisao.setId(id);
        revisao.setAtividade(atividade);
        revisao.setProntuario(prontuario);
        revisao.setFinalizada(true);
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
    @DisplayName("Deve calcular corretamente os indicadores IHI-GTT para revisões homologadas")
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

        // Rev 1 tem 1 evento adverso (confirmou dano, não presente na admissão,
        // categoria E)
        AchadoGatilho achado1 = new AchadoGatilho();
        achado1.setConfirmouDano(true);
        achado1.setDanoPresenteAdmissao(false);
        achado1.setGravidade(GravidadeNccMerp.CATEGORIA_E);
        when(achadoRepositorio.findByRevisaoIndividualId(1L)).thenReturn(List.of(achado1));

        // Rev 2 não tem dano
        when(achadoRepositorio.findByRevisaoIndividualId(2L)).thenReturn(List.of());

        Map<String, Object> indicadores = servico.calcularIndicadoresIndividuais(
                null, null, null, null, null, null);

        assertEquals(2, indicadores.get("totalProntuariosRevistos"));
        assertEquals(25, indicadores.get("totalDiasInternacao"));
        assertEquals(1, indicadores.get("totalEventosAdversos"));
        assertEquals(1, indicadores.get("prontuariosComDano"));

        // Taxa de Danos por 1000 dias: (1 / 25) * 1000 = 40.0
        assertEquals(40.0, indicadores.get("taxaDanosPorMilDias"));
        // Frequência por 100 admissões: (1 / 2) * 100 = 50.0%
        assertEquals(50.0, indicadores.get("frequenciaPorCemAdmissoes"));
        // Prevalência percentual: (1 / 2) * 100 = 50.0%
        assertEquals(50.0, indicadores.get("prevalenciaPercentual"));
    }
}
