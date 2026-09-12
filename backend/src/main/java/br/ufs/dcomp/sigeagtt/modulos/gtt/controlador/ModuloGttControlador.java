package br.ufs.dcomp.sigeagtt.modulos.gtt.controlador;

import br.ufs.dcomp.sigeagtt.modulos.gtt.dto.ModuloGttRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.gtt.modelo.ModuloGtt;
import br.ufs.dcomp.sigeagtt.modulos.gtt.servico.ModuloGttServico;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/modulos-gtt")
public class ModuloGttControlador {

    private final ModuloGttServico servico;

    public ModuloGttControlador(ModuloGttServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public ResponseEntity<List<ModuloGtt>> listar() {
        return ResponseEntity.ok(servico.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModuloGtt> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ModuloGtt> cadastrar(@Valid @RequestBody ModuloGttRequisicaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servico.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModuloGtt> editar(@PathVariable Long id, @Valid @RequestBody ModuloGttRequisicaoDTO dto) {
        return ResponseEntity.ok(servico.editar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> excluir(@PathVariable Long id) {
        servico.excluir(id);
        return ResponseEntity.ok(Map.of("mensagem", "Módulo e gatilhos associados excluídos com sucesso."));
    }

    @PatchMapping("/{id}/alternar-status")
    public ResponseEntity<ModuloGtt> alternarStatus(@PathVariable Long id) {
        return ResponseEntity.ok(servico.alternarStatus(id));
    }
}
