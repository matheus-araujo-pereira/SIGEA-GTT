package br.ufs.dcomp.sigeagtt.modulos.educacional.servico;

import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.AvaliarSubmissaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.SubmissaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.*;
import br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio.*;
import br.ufs.dcomp.sigeagtt.modulos.gtt.repositorio.GatilhoGttRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.turma.modelo.Turma;
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
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubmissaoAtividadeServicoTest {

    @Mock
    private SubmissaoAtividadeRepositorio submissaoRepositorio;
    @Mock
    private AtividadeEducacionalRepositorio atividadeRepositorio;
    @Mock
    private GatilhoGttRepositorio gatilhoRepositorio;
    @Mock
    private CategoriaEventoAdversoRepositorio categoriaRepositorio;
    @Mock
    private SubmissaoGatilhoRepositorio submissaoGatilhoRepositorio;
    @Mock
    private SubmissaoIshikawaRepositorio submissaoIshikawaRepositorio;
    @Mock
    private SubmissaoPlano5w3hRepositorio submissaoPlano5w3hRepositorio;
    @Mock
    private SubmissaoPdcaRepositorio submissaoPdcaRepositorio;

    @InjectMocks
    private SubmissaoAtividadeServico servico;

    private Usuario professor;
    private Usuario aluno;
    private Turma turma;
    private AtividadeEducacional atividade;
    private CasoClinico caso;
    private SubmissaoAtividade submissao;

    @BeforeEach
    void setUp() {
        professor = new Usuario();
        professor.setId(10L);
        professor.setNomeCompleto("Prof. Ana Waleska");
        professor.setEmail("anawaleska@academico.ufs.br");
        professor.setPerfil(PerfilUsuario.PROFESSOR);

        aluno = new Usuario();
        aluno.setId(20L);
        aluno.setNomeCompleto("Lucas Sampaio");
        aluno.setEmail("lucas.sampaio@academico.ufs.br");
        aluno.setPerfil(PerfilUsuario.ALUNO);

        turma = new Turma();
        turma.setId(100L);
        turma.setPeriodoLetivo("2026.1");
        turma.setCodigoDisciplina("MED001");
        turma.setNomeDisciplina("Semiologia Médica");
        turma.setProfessorResponsavel(professor);

        caso = new CasoClinico();
        caso.setId(200L);
        caso.setTitulo("Caso Clínico - Sepse Grave");

        atividade = new AtividadeEducacional();
        atividade.setId(300L);
        atividade.setTitulo("Atividade Prática 01 - HU-UFS");
        atividade.setTurma(turma);
        atividade.setCasoClinico(caso);
        atividade.setTempoLimiteMinutos(20);

        submissao = new SubmissaoAtividade();
        submissao.setId(400L);
        submissao.setAtividade(atividade);
        submissao.setAluno(aluno);
        submissao.setStatus(StatusSubmissao.SUBMETIDA);
        submissao.setDataInicio(LocalDateTime.now().minusMinutes(15));
        submissao.setDataSubmissao(LocalDateTime.now());
        submissao.setTempoGastoSegundos(900);
    }

    @Test
    @DisplayName("Deve avaliar submissao com sucesso quando o professor responsavel submeter nota e parecer")
    void deveAvaliarSubmissaoComSucesso() {
        when(submissaoRepositorio.findById(400L)).thenReturn(Optional.of(submissao));
        when(submissaoRepositorio.save(any(SubmissaoAtividade.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AvaliarSubmissaoDTO dto = new AvaliarSubmissaoDTO(
            new BigDecimal("9.50"),
            "Excelente identificação dos gatilhos e estruturação do diagrama de Ishikawa 6M."
        );

        SubmissaoDTO resultado = servico.avaliar(400L, dto, professor);

        assertNotNull(resultado);
        assertEquals(StatusSubmissao.AVALIADA, resultado.status());
        assertEquals(new BigDecimal("9.50"), resultado.nota());
        assertEquals("Excelente identificação dos gatilhos e estruturação do diagrama de Ishikawa 6M.", resultado.parecerDocente());
        assertEquals("Prof. Ana Waleska", resultado.professorCorretorNome());
        verify(submissaoRepositorio, times(1)).save(any(SubmissaoAtividade.class));
    }

    @Test
    @DisplayName("Deve rejeitar avaliacao se professor nao for o responsavel pela turma nem administrador")
    void deveRejeitarAvaliacaoSeNaoForProfessorDaTurma() {
        Usuario outroProfessor = new Usuario();
        outroProfessor.setId(99L);
        outroProfessor.setPerfil(PerfilUsuario.PROFESSOR);

        when(submissaoRepositorio.findById(400L)).thenReturn(Optional.of(submissao));

        AvaliarSubmissaoDTO dto = new AvaliarSubmissaoDTO(new BigDecimal("8.00"), "Ok");

        assertThrows(IllegalArgumentException.class, () -> servico.avaliar(400L, dto, outroProfessor));
        verify(submissaoRepositorio, never()).save(any());
    }

    @Test
    @DisplayName("Deve retornar submissao existente ao iniciarOuRetomar se aluno ja iniciou")
    void deveRetornarSubmissaoExistenteAoIniciar() {
        when(atividadeRepositorio.findById(300L)).thenReturn(Optional.of(atividade));
        when(submissaoRepositorio.findByAtividadeIdAndAlunoId(300L, aluno.getId())).thenReturn(Optional.of(submissao));

        SubmissaoDTO resultado = servico.iniciarOuContinuar(300L, aluno);

        assertNotNull(resultado);
        assertEquals(400L, resultado.id());
        verify(submissaoRepositorio, never()).save(any());
    }
}
