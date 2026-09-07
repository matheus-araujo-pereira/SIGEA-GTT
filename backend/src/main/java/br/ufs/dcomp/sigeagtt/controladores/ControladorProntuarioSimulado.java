package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.servicos.ProntuarioSimuladoServico;
import br.ufs.dcomp.sigeagtt.transferencia.ProntuarioSimuladoRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.ProntuarioSimuladoRespostaDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prontuarios-simulados")
public class ControladorProntuarioSimulado {

    private final ProntuarioSimuladoServico servico;

    public ControladorProntuarioSimulado(ProntuarioSimuladoServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public ResponseEntity<List<ProntuarioSimuladoRespostaDTO>> listar(@RequestParam(required = false) Long cenarioId) {
        return ResponseEntity.ok(servico.listar(cenarioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProntuarioSimuladoRespostaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProntuarioSimuladoRespostaDTO> cadastrar(@Valid @RequestBody ProntuarioSimuladoRequisicaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servico.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProntuarioSimuladoRespostaDTO> editar(@PathVariable Long id, @Valid @RequestBody ProntuarioSimuladoRequisicaoDTO dto) {
        return ResponseEntity.ok(servico.editar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> excluir(@PathVariable Long id) {
        servico.excluir(id);
        return ResponseEntity.ok(Map.of("mensagem", "Prontuário simulado excluído com sucesso."));
    }
}
