package br.ufs.dcomp.sigeagtt.modulos.gtt.controlador;

import br.ufs.dcomp.sigeagtt.modulos.gtt.dto.GatilhoGttRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.gtt.modelo.GatilhoGtt;
import br.ufs.dcomp.sigeagtt.modulos.gtt.servico.GatilhoGttServico;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gatilhos")
public class GatilhoGttControlador {

    private final GatilhoGttServico servico;

    public GatilhoGttControlador(GatilhoGttServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public ResponseEntity<List<GatilhoGtt>> listar(@RequestParam(required = false) Long moduloId) {
        return ResponseEntity.ok(servico.listar(moduloId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GatilhoGtt> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<GatilhoGtt> cadastrar(@Valid @RequestBody GatilhoGttRequisicaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servico.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GatilhoGtt> editar(@PathVariable Long id, @Valid @RequestBody GatilhoGttRequisicaoDTO dto) {
        return ResponseEntity.ok(servico.editar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> excluir(@PathVariable Long id) {
        servico.excluir(id);
        return ResponseEntity.ok(Map.of("mensagem", "Gatilho excluído com sucesso."));
    }

    @PatchMapping("/{id}/alternar-status")
    public ResponseEntity<GatilhoGtt> alternarStatus(@PathVariable Long id) {
        return ResponseEntity.ok(servico.alternarStatus(id));
    }
}
