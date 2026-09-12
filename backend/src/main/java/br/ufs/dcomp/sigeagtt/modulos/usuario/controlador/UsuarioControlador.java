package br.ufs.dcomp.sigeagtt.modulos.usuario.controlador;

import br.ufs.dcomp.sigeagtt.modulos.usuario.dto.AlterarSenhaDTO;
import br.ufs.dcomp.sigeagtt.modulos.usuario.dto.UsuarioEdicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.usuario.dto.UsuarioRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.usuario.dto.UsuarioRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.usuario.servico.UsuarioServico;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioControlador {

    private final UsuarioServico servico;

    public UsuarioControlador(UsuarioServico servico) {
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

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioRespostaDTO> editar(@PathVariable Long id, @Valid @RequestBody UsuarioEdicaoDTO dto) {
        return ResponseEntity.ok(servico.editar(id, dto));
    }

    @PatchMapping("/{id}/resetar-senha")
    public ResponseEntity<UsuarioRespostaDTO> resetarSenha(@PathVariable Long id) {
        return ResponseEntity.ok(servico.resetarSenha(id));
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<UsuarioRespostaDTO> inativar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.inativar(id));
    }

    @PatchMapping("/{id}/reativar")
    public ResponseEntity<UsuarioRespostaDTO> reativar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.reativar(id));
    }

    @PatchMapping("/{id}/alterar-senha")
    public ResponseEntity<UsuarioRespostaDTO> alterarSenha(@PathVariable Long id,
            @Valid @RequestBody AlterarSenhaDTO dto) {
        return ResponseEntity.ok(servico.alterarSenha(id, dto));
    }
}
