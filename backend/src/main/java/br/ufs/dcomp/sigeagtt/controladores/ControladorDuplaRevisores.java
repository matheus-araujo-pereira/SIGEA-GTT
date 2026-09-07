package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.servicos.DuplaRevisoresServico;
import br.ufs.dcomp.sigeagtt.transferencia.DuplaRevisoresRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.DuplaRevisoresRespostaDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/duplas-revisores")
public class ControladorDuplaRevisores {

    private final DuplaRevisoresServico servico;

    public ControladorDuplaRevisores(DuplaRevisoresServico servico) {
        this.servico = servico;
    }

    @GetMapping("/atividade/{atividadeId}")
    public ResponseEntity<List<DuplaRevisoresRespostaDTO>> listarPorAtividade(@PathVariable Long atividadeId) {
        return ResponseEntity.ok(servico.listarPorAtividade(atividadeId));
    }

    @PostMapping
    public ResponseEntity<DuplaRevisoresRespostaDTO> cadastrar(@Valid @RequestBody DuplaRevisoresRequisicaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servico.cadastrar(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> excluir(@PathVariable Long id) {
        servico.excluir(id);
        return ResponseEntity.ok(Map.of("mensagem", "Dupla de revisores removida com sucesso."));
    }

    @PatchMapping("/{id}/alternar-status")
    public ResponseEntity<DuplaRevisoresRespostaDTO> alternarStatus(@PathVariable Long id) {
        return ResponseEntity.ok(servico.alternarStatus(id));
    }
}
