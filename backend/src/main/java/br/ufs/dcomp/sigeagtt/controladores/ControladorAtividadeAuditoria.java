package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.servicos.AtividadeAuditoriaServico;
import br.ufs.dcomp.sigeagtt.transferencia.AtividadeAuditoriaRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.AtividadeAuditoriaRespostaDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/atividades-auditoria")
public class ControladorAtividadeAuditoria {

    private final AtividadeAuditoriaServico servico;

    public ControladorAtividadeAuditoria(AtividadeAuditoriaServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public ResponseEntity<List<AtividadeAuditoriaRespostaDTO>> listar(@RequestParam(required = false) Long turmaId) {
        return ResponseEntity.ok(servico.listar(turmaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtividadeAuditoriaRespostaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<AtividadeAuditoriaRespostaDTO> cadastrar(@Valid @RequestBody AtividadeAuditoriaRequisicaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servico.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtividadeAuditoriaRespostaDTO> editar(@PathVariable Long id, @Valid @RequestBody AtividadeAuditoriaRequisicaoDTO dto) {
        return ResponseEntity.ok(servico.editar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> excluir(@PathVariable Long id) {
        servico.excluir(id);
        return ResponseEntity.ok(Map.of("mensagem", "Atividade de auditoria excluída com sucesso."));
    }

    @PatchMapping("/{id}/alternar-finalizada")
    public ResponseEntity<AtividadeAuditoriaRespostaDTO> alternarFinalizada(@PathVariable Long id) {
        return ResponseEntity.ok(servico.alternarFinalizada(id));
    }
}
