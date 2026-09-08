package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.servicos.AutenticacaoServico;
import br.ufs.dcomp.sigeagtt.transferencia.LoginRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.LoginRespostaDTO;
import br.ufs.dcomp.sigeagtt.transferencia.PrimeiroAcessoRequisicaoDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/autenticacao")
public class ControladorAutenticacao {

    private final AutenticacaoServico servico;
    private final SecurityContextRepository securityContextRepository;

    public ControladorAutenticacao(AutenticacaoServico servico, SecurityContextRepository securityContextRepository) {
        this.servico = servico;
        this.securityContextRepository = securityContextRepository;
    }

    @PostMapping("/entrar")
    public ResponseEntity<LoginRespostaDTO> entrar(@Valid @RequestBody LoginRequisicaoDTO dto,
            HttpServletRequest request, HttpServletResponse response) {
        LoginRespostaDTO resposta = servico.autenticar(dto);
        autenticarSessao(resposta, request, response);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/primeiro-acesso")
    public ResponseEntity<LoginRespostaDTO> primeiroAcesso(@Valid @RequestBody PrimeiroAcessoRequisicaoDTO dto,
            HttpServletRequest request, HttpServletResponse response) {
        LoginRespostaDTO resposta = servico.redefinirSenhaPrimeiroAcesso(dto);
        autenticarSessao(resposta, request, response);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/sair")
    public ResponseEntity<Map<String, String>> sair(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        if (request.getSession(false) != null)
            request.getSession(false).invalidate();
        return ResponseEntity.ok(Map.of("mensagem", "Sessão finalizada."));
    }

    private void autenticarSessao(LoginRespostaDTO resposta, HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                resposta.email(), null,
                List.of(new SimpleGrantedAuthority("ROLE_" + resposta.perfil().name())));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }
}
