package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.servicos.MelhoriaQualidadeServico;
import br.ufs.dcomp.sigeagtt.transferencia.MelhoriaQualidadeRespostaDTO;
import br.ufs.dcomp.sigeagtt.transferencia.SalvarMelhoriaQualidadeDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/melhoria-qualidade")
public class ControladorMelhoriaQualidade {

    private final MelhoriaQualidadeServico servico;

    public ControladorMelhoriaQualidade(MelhoriaQualidadeServico servico) {
        this.servico = servico;
    }

    @GetMapping("/consenso/{consensoDuplaId}")
    public ResponseEntity<MelhoriaQualidadeRespostaDTO> buscarPorConsenso(@PathVariable Long consensoDuplaId) {
        return ResponseEntity.ok(servico.buscarPorConsenso(consensoDuplaId));
    }

    @PutMapping("/consenso/{consensoDuplaId}")
    public ResponseEntity<MelhoriaQualidadeRespostaDTO> salvar(
            @PathVariable Long consensoDuplaId,
            @Valid @RequestBody SalvarMelhoriaQualidadeDTO dto) {
        return ResponseEntity.ok(servico.salvar(consensoDuplaId, dto));
    }
}
