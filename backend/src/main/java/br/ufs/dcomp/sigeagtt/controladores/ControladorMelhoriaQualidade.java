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

    @GetMapping("/revisao/{revisaoId}")
    public ResponseEntity<MelhoriaQualidadeRespostaDTO> buscarPorRevisao(@PathVariable Long revisaoId) {
        return ResponseEntity.ok(servico.buscar(revisaoId));
    }

    @RequestMapping(value = "/revisao/{revisaoId}", method = { RequestMethod.PUT, RequestMethod.POST })
    public ResponseEntity<MelhoriaQualidadeRespostaDTO> salvarPorRevisao(
            @PathVariable Long revisaoId,
            @Valid @RequestBody SalvarMelhoriaQualidadeDTO dto) {
        return ResponseEntity.ok(servico.salvar(revisaoId, dto));
    }
}
