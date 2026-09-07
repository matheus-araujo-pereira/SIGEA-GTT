package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.modelos.GatilhoGtt;
import br.ufs.dcomp.sigeagtt.modelos.ModuloGtt;
import br.ufs.dcomp.sigeagtt.repositorios.GatilhoGttRepositorio;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gatilhos")
public class ControladorGatilhoGtt {

    private final GatilhoGttRepositorio repositorio;

    public ControladorGatilhoGtt(GatilhoGttRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    @GetMapping
    public ResponseEntity<List<GatilhoGtt>> listar(@RequestParam(required = false) ModuloGtt modulo) {
        if (modulo != null) {
            return ResponseEntity.ok(repositorio.findByModulo(modulo));
        }
        return ResponseEntity.ok(repositorio.findAll());
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<GatilhoGtt> buscarPorCodigo(@PathVariable String codigo) {
        return repositorio.findByCodigo(codigo.toUpperCase())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/alternar-status")
    public ResponseEntity<GatilhoGtt> alternarStatus(@PathVariable Long id) {
        GatilhoGtt gatilho = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Gatilho não encontrado: " + id));
        gatilho.setAtivo(!Boolean.TRUE.equals(gatilho.getAtivo()));
        return ResponseEntity.ok(repositorio.save(gatilho));
    }
}
