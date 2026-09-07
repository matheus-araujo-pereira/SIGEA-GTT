package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.servicos.ConsensoDuplaServico;
import br.ufs.dcomp.sigeagtt.transferencia.ConsensoDuplaRespostaDTO;
import br.ufs.dcomp.sigeagtt.transferencia.HomologarConsensoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.SubmeterConsensoDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consensos-duplas")
public class ControladorConsensoDupla {

    private final ConsensoDuplaServico servico;

    public ControladorConsensoDupla(ConsensoDuplaServico servico) {
        this.servico = servico;
    }

    @GetMapping("/dupla/{duplaId}/prontuario/{prontuarioId}")
    public ResponseEntity<ConsensoDuplaRespostaDTO> obterOuCriarConsenso(
            @PathVariable Long duplaId,
            @PathVariable Long prontuarioId) {
        return ResponseEntity.ok(servico.obterOuCriarConsenso(duplaId, prontuarioId));
    }

    @PutMapping("/{id}/salvar")
    public ResponseEntity<ConsensoDuplaRespostaDTO> salvarConsenso(
            @PathVariable Long id,
            @Valid @RequestBody SubmeterConsensoDTO dto) {
        return ResponseEntity.ok(servico.salvarConsenso(id, dto));
    }

    @PostMapping("/{id}/validar-docente")
    public ResponseEntity<ConsensoDuplaRespostaDTO> validarEHomologar(
            @PathVariable Long id,
            @Valid @RequestBody HomologarConsensoDTO dto) {
        return ResponseEntity.ok(servico.validarEHomologar(id, dto));
    }
}
