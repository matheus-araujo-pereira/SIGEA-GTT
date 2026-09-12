package br.ufs.dcomp.sigeagtt.modulos.unidade.controlador;

import br.ufs.dcomp.sigeagtt.modulos.unidade.dto.UnidadeHospitalarRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.unidade.modelo.UnidadeHospitalar;
import br.ufs.dcomp.sigeagtt.modulos.unidade.servico.UnidadeHospitalarServico;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/unidades")
public class UnidadeHospitalarControlador {

    private final UnidadeHospitalarServico servico;

    public UnidadeHospitalarControlador(UnidadeHospitalarServico servico) {
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
