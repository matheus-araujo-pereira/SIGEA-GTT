package br.ufs.dcomp.sigeagtt.modulos.qualidade.controlador;

import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.MelhoriaQualidadeRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.SalvarMelhoriaQualidadeDTO;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.servico.MelhoriaQualidadeServico;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/melhoria-qualidade/revisao/{revisaoId}")
public class MelhoriaQualidadeControlador {

    private final MelhoriaQualidadeServico servico;

    public MelhoriaQualidadeControlador(MelhoriaQualidadeServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public ResponseEntity<MelhoriaQualidadeRespostaDTO> buscarPorRevisao(@PathVariable Long revisaoId) {
        return ResponseEntity.ok(servico.buscar(revisaoId));
    }

    @RequestMapping(method = { RequestMethod.PUT, RequestMethod.POST })
    public ResponseEntity<MelhoriaQualidadeRespostaDTO> salvarPorRevisao(
            @PathVariable Long revisaoId,
            @Valid @RequestBody SalvarMelhoriaQualidadeDTO dto) {
        return ResponseEntity.ok(servico.salvar(revisaoId, dto));
    }
}
