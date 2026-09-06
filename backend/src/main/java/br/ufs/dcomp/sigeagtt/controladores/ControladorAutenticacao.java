package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.servicos.AutenticacaoServico;
import br.ufs.dcomp.sigeagtt.transferencia.LoginRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.LoginRespostaDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/autenticacao")
public class ControladorAutenticacao {

    private final AutenticacaoServico servico;

    public ControladorAutenticacao(AutenticacaoServico servico) {
        this.servico = servico;
    }

    @PostMapping("/entrar")
    public ResponseEntity<LoginRespostaDTO> entrar(@Valid @RequestBody LoginRequisicaoDTO dto) {
        return ResponseEntity.ok(servico.autenticar(dto));
    }

    @PostMapping("/sair")
    public ResponseEntity<Map<String, String>> sair() {
        return ResponseEntity.ok(Map.of("mensagem", "Sessão encerrada com sucesso."));
    }
}
