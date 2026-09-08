package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.servicos.RevisaoIndividualServico;
import br.ufs.dcomp.sigeagtt.transferencia.AtividadeDiscenteDTO;
import br.ufs.dcomp.sigeagtt.transferencia.IniciarRevisaoRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.RevisaoIndividualRespostaDTO;
import br.ufs.dcomp.sigeagtt.transferencia.SalvarRevisaoRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.AuditoriaAlunoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.CorrigirAuditoriaRequisicaoDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/revisoes-individuais")
public class ControladorRevisaoIndividual {

    private final RevisaoIndividualServico servico;

    public ControladorRevisaoIndividual(RevisaoIndividualServico servico) {
        this.servico = servico;
    }

    @GetMapping("/minhas-atividades")
    public ResponseEntity<List<AtividadeDiscenteDTO>> listarMinhasAtividades(@RequestParam Long alunoId) {
        return ResponseEntity.ok(servico.listarAtividadesDoAluno(alunoId));
    }

    @PostMapping("/iniciar")
    public ResponseEntity<RevisaoIndividualRespostaDTO> iniciar(@Valid @RequestBody IniciarRevisaoRequisicaoDTO dto) {
        return ResponseEntity.ok(servico.obterOuIniciarRevisao(dto));
    }

    @GetMapping("/atividade/{atividadeId}/alunos")
    public ResponseEntity<List<AuditoriaAlunoDTO>> listarAuditorias(@PathVariable Long atividadeId) {
        return ResponseEntity.ok(servico.listarAuditoriasDaAtividade(atividadeId));
    }

    @PutMapping("/{id}/salvar")
    public ResponseEntity<RevisaoIndividualRespostaDTO> salvar(@PathVariable Long id,
            @Valid @RequestBody SalvarRevisaoRequisicaoDTO dto) {
        return ResponseEntity.ok(servico.salvarAchadosETempo(id, dto));
    }

    @PutMapping("/{id}/correcao")
    public ResponseEntity<RevisaoIndividualRespostaDTO> corrigir(@PathVariable Long id,
            @RequestParam Long professorId,
            @Valid @RequestBody CorrigirAuditoriaRequisicaoDTO dto) {
        return ResponseEntity.ok(servico.corrigirAuditoria(id, professorId, dto));
    }
}
