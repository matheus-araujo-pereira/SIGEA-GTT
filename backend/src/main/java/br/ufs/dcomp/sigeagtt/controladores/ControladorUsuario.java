package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.servicos.UsuarioServico;
import br.ufs.dcomp.sigeagtt.transferencia.UsuarioRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.UsuarioRespostaDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class ControladorUsuario {

    private final UsuarioServico servico;

    public ControladorUsuario(UsuarioServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioRespostaDTO>> listar() {
        return ResponseEntity.ok(servico.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioRespostaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioRespostaDTO> cadastrar(@Valid @RequestBody UsuarioRequisicaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servico.cadastrar(dto));
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<UsuarioRespostaDTO> inativar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.inativar(id));
    }

    @PatchMapping("/{id}/reativar")
    public ResponseEntity<UsuarioRespostaDTO> reativar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.reativar(id));
    }
}
