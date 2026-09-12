package br.ufs.dcomp.sigeagtt.modulos.auditoria.controlador;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.AtividadeDiscenteDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.AuditoriaAlunoDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.CorrigirAuditoriaRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.IniciarRevisaoRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.RevisaoIndividualRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.SalvarRevisaoRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.servico.RevisaoIndividualServico;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/revisoes-individuais")
public class RevisaoIndividualControlador {

    private final RevisaoIndividualServico servico;

    public RevisaoIndividualControlador(RevisaoIndividualServico servico) {
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
