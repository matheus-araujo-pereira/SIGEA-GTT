package br.ufs.dcomp.sigeagtt.modulos.autenticacao.controlador;

import br.ufs.dcomp.sigeagtt.modulos.autenticacao.dto.LoginRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.autenticacao.dto.LoginRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.autenticacao.dto.PrimeiroAcessoRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.autenticacao.servico.AutenticacaoServico;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.repositorio.UsuarioRepositorio;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/autenticacao")
public class AutenticacaoControlador {

    private final AutenticacaoServico servico;
    private final SecurityContextRepository securityContextRepository;
    private final UsuarioRepositorio usuarioRepositorio;

    public AutenticacaoControlador(
            AutenticacaoServico servico,
            SecurityContextRepository securityContextRepository,
            UsuarioRepositorio usuarioRepositorio) {
        this.servico = servico;
        this.securityContextRepository = securityContextRepository;
        this.usuarioRepositorio = usuarioRepositorio;
    }

    @PostMapping("/entrar")
    public ResponseEntity<LoginRespostaDTO> entrar(
            @Valid @RequestBody LoginRequisicaoDTO dto,
            HttpServletRequest request,
            HttpServletResponse response) {
        LoginRespostaDTO resposta = servico.autenticar(dto);
        autenticarSessao(resposta, request, response);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/primeiro-acesso")
    public ResponseEntity<LoginRespostaDTO> primeiroAcesso(
            @Valid @RequestBody PrimeiroAcessoRequisicaoDTO dto,
            HttpServletRequest request,
            HttpServletResponse response) {
        LoginRespostaDTO resposta = servico.redefinirSenhaPrimeiroAcesso(dto);
        autenticarSessao(resposta, request, response);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/sair")
    public ResponseEntity<Map<String, String>> sair(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        if (request.getSession(false) != null) request.getSession(false).invalidate();
        return ResponseEntity.ok(Map.of("mensagem", "Sessão finalizada."));
    }

    private void autenticarSessao(
            LoginRespostaDTO resposta, HttpServletRequest request, HttpServletResponse response) {
        String role = "ROLE_" + resposta.perfil().name();
        Usuario usuario =
                resposta.id() != null
                        ? usuarioRepositorio.findById(resposta.id()).orElse(null)
                        : usuarioRepositorio.findByEmail(resposta.email()).orElse(null);

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        usuario != null ? usuario : resposta.email(),
                        null,
                        List.of(new SimpleGrantedAuthority(role)));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }
}
