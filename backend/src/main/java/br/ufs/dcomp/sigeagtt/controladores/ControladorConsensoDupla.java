package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.servicos.ConsensoDuplaServico;
import br.ufs.dcomp.sigeagtt.transferencia.ComparativoRevisaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.ConsensoDuplaRespostaDTO;
import br.ufs.dcomp.sigeagtt.transferencia.HomologarConsensoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.SubmeterConsensoDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/comparativo")
    public ResponseEntity<ComparativoRevisaoDTO> obterComparativo(
            @RequestParam Long duplaId,
            @RequestParam Long prontuarioId) {
        ConsensoDuplaRespostaDTO resposta = servico.obterOuCriarConsenso(duplaId, prontuarioId);
        return ResponseEntity.ok(resposta.comparativo());
    }

    @PostMapping
    public ResponseEntity<ConsensoDuplaRespostaDTO> criarESubmeterConsenso(
            @RequestParam Long duplaId,
            @RequestParam Long prontuarioId,
            @Valid @RequestBody SubmeterConsensoDTO dto) {
        ConsensoDuplaRespostaDTO consenso = servico.obterOuCriarConsenso(duplaId, prontuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(servico.salvarConsenso(consenso.id(), dto));
    }

    @PutMapping("/{id}/salvar")
    public ResponseEntity<ConsensoDuplaRespostaDTO> salvarConsenso(
            @PathVariable Long id,
            @Valid @RequestBody SubmeterConsensoDTO dto) {
        return ResponseEntity.ok(servico.salvarConsenso(id, dto));
    }

    @PostMapping(value = {"/{id}/validar-docente", "/{id}/homologar"})
    public ResponseEntity<ConsensoDuplaRespostaDTO> validarEHomologar(
            @PathVariable Long id,
            @Valid @RequestBody HomologarConsensoDTO dto) {
        return ResponseEntity.ok(servico.validarEHomologar(id, dto));
    }
}
