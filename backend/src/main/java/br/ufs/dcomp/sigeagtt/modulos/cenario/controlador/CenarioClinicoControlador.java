package br.ufs.dcomp.sigeagtt.modulos.cenario.controlador;

import br.ufs.dcomp.sigeagtt.modulos.cenario.dto.CenarioClinicoRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.cenario.dto.CenarioClinicoRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.cenario.servico.CenarioClinicoServico;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cenarios-clinicos")
public class CenarioClinicoControlador {

    private final CenarioClinicoServico servico;

    public CenarioClinicoControlador(CenarioClinicoServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public ResponseEntity<List<CenarioClinicoRespostaDTO>> listar(@RequestParam(required = false) Long professorId) {
        return ResponseEntity.ok(servico.listar(professorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CenarioClinicoRespostaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<CenarioClinicoRespostaDTO> cadastrar(@Valid @RequestBody CenarioClinicoRequisicaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servico.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CenarioClinicoRespostaDTO> editar(@PathVariable Long id, @Valid @RequestBody CenarioClinicoRequisicaoDTO dto) {
        return ResponseEntity.ok(servico.editar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> excluir(@PathVariable Long id) {
        servico.excluir(id);
        return ResponseEntity.ok(Map.of("mensagem", "Cenário clínico e prontuários vinculados excluídos com sucesso."));
    }
}
