package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.modelos.UnidadeHospitalar;
import br.ufs.dcomp.sigeagtt.repositorios.UnidadeHospitalarRepositorio;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unidades")
public class ControladorUnidadeHospitalar {

    private final UnidadeHospitalarRepositorio repositorio;

    public ControladorUnidadeHospitalar(UnidadeHospitalarRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    @GetMapping
    public ResponseEntity<List<UnidadeHospitalar>> listar() {
        return ResponseEntity.ok(repositorio.findAll());
    }

    @PostMapping
    public ResponseEntity<UnidadeHospitalar> cadastrar(@Valid @RequestBody UnidadeHospitalar unidade) {
        unidade.setAtiva(true);
        return ResponseEntity.status(HttpStatus.CREATED).body(repositorio.save(unidade));
    }

    @PatchMapping("/{id}/alternar-status")
    public ResponseEntity<UnidadeHospitalar> alternarStatus(@PathVariable Long id) {
        UnidadeHospitalar unidade = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unidade não encontrada: " + id));
        unidade.setAtiva(!Boolean.TRUE.equals(unidade.getAtiva()));
        return ResponseEntity.ok(repositorio.save(unidade));
    }
}
