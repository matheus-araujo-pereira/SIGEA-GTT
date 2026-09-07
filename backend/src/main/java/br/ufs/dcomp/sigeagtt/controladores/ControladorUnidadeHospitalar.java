package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.modelos.UnidadeHospitalar;
import br.ufs.dcomp.sigeagtt.servicos.UnidadeHospitalarServico;
import br.ufs.dcomp.sigeagtt.transferencia.UnidadeHospitalarRequisicaoDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/unidades")
public class ControladorUnidadeHospitalar {

    private final UnidadeHospitalarServico servico;

    public ControladorUnidadeHospitalar(UnidadeHospitalarServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public ResponseEntity<List<UnidadeHospitalar>> listar() {
        return ResponseEntity.ok(servico.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnidadeHospitalar> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<UnidadeHospitalar> cadastrar(@Valid @RequestBody UnidadeHospitalarRequisicaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servico.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnidadeHospitalar> editar(@PathVariable Long id, @Valid @RequestBody UnidadeHospitalarRequisicaoDTO dto) {
        return ResponseEntity.ok(servico.editar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> excluir(@PathVariable Long id) {
        servico.excluir(id);
        return ResponseEntity.ok(Map.of("mensagem", "Unidade hospitalar excluída com sucesso."));
    }

    @PatchMapping("/{id}/alternar-status")
    public ResponseEntity<UnidadeHospitalar> alternarStatus(@PathVariable Long id) {
        return ResponseEntity.ok(servico.alternarStatus(id));
    }
}
