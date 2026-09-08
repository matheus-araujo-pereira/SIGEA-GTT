package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.servicos.AutenticacaoServico;
import br.ufs.dcomp.sigeagtt.transferencia.LoginRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.LoginRespostaDTO;
import br.ufs.dcomp.sigeagtt.transferencia.PrimeiroAcessoRequisicaoDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/autenticacao")
public class ControladorAutenticacao {

    private final AutenticacaoServico servico;

    public ControladorAutenticacao(AutenticacaoServico servico) {
        this.servico = servico;
    }

    @PostMapping("/entrar")
    public ResponseEntity<LoginRespostaDTO> entrar(@Valid @RequestBody LoginRequisicaoDTO dto,
            HttpServletRequest request) {
        LoginRespostaDTO resposta = servico.autenticar(dto);
        request.getSession(true).setAttribute("usuarioId", resposta.id());
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/primeiro-acesso")
    public ResponseEntity<LoginRespostaDTO> primeiroAcesso(@Valid @RequestBody PrimeiroAcessoRequisicaoDTO dto,
            HttpServletRequest request) {
        LoginRespostaDTO resposta = servico.redefinirSenhaPrimeiroAcesso(dto);
        request.getSession(true).setAttribute("usuarioId", resposta.id());
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/sair")
    public ResponseEntity<Map<String, String>> sair(HttpServletRequest request) {
        if (request.getSession(false) != null)
            request.getSession(false).invalidate();
        return ResponseEntity.ok(Map.of("mensagem", "Sessão finalizada."));
    }
}
