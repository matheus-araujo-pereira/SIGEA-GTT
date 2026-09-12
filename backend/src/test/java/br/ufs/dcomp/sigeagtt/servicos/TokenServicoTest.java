package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modelos.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.*;

class TokenServicoTest {

    private TokenServico tokenServico;
    private final String segredoTeste = "chave-secreta-de-testes-unitarios-sigea-gtt-2026";
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        tokenServico = new TokenServico(segredoTeste, objectMapper);
    }

    private Usuario criarUsuarioMock(Long id, String email, PerfilUsuario perfil) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setNomeCompleto("Usuário Teste");
        usuario.setEmail(email);
        usuario.setPerfil(perfil);
        usuario.setSenha("senha123");
        usuario.setPrimeiroAcesso(false);
        usuario.setAtivo(true);
        return usuario;
    }

    @Test
    @DisplayName("Deve gerar um token JWT bem formatado com 3 partes")
    void deveGerarTokenValido() {
        Usuario usuario = criarUsuarioMock(10L, "professor@academico.ufs.br", PerfilUsuario.PROFESSOR);

        String token = tokenServico.gerarToken(usuario);

        assertNotNull(token);
        assertFalse(token.isBlank());
        String[] partes = token.split("\\.");
        assertEquals(3, partes.length, "Token JWT deve conter header, payload e signature");
    }

    @Test
    @DisplayName("Deve validar o token e extrair os dados do usuário corretamente")
    void deveValidarTokenComSucesso() {
        Usuario usuario = criarUsuarioMock(42L, "aluno@academico.ufs.br", PerfilUsuario.ALUNO);
        String token = tokenServico.gerarToken(usuario);

        TokenServico.DadosToken dados = tokenServico.validarToken(token);

        assertNotNull(dados);
        assertEquals(42L, dados.id());
        assertEquals("aluno@academico.ufs.br", dados.email());
        assertEquals("ALUNO", dados.perfil());
    }

    @Test
    @DisplayName("Deve rejeitar token quando a assinatura for adulterada")
    void deveRejeitarTokenComAssinaturaInvalida() {
        Usuario usuario = criarUsuarioMock(1L, "admin@academico.ufs.br", PerfilUsuario.ADMINISTRADOR);
        String token = tokenServico.gerarToken(usuario);

        String tokenAdulterado = token.substring(0, token.length() - 4) + "XXXX";
        TokenServico.DadosToken dados = tokenServico.validarToken(tokenAdulterado);

        assertNull(dados, "Token com assinatura adulterada deve retornar null");
    }

    @Test
    @DisplayName("Deve retornar null para tokens nulos ou vazios")
    void deveRetornarNullParaEntradasInvalidas() {
        assertNull(tokenServico.validarToken(null));
        assertNull(tokenServico.validarToken(""));
        assertNull(tokenServico.validarToken("   "));
        assertNull(tokenServico.validarToken("token.invalido"));
    }
}
