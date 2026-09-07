package br.ufs.dcomp.sigeagtt.controladores;

import br.ufs.dcomp.sigeagtt.servicos.TurmaServico;
import br.ufs.dcomp.sigeagtt.transferencia.TurmaRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.TurmaRespostaDTO;
import br.ufs.dcomp.sigeagtt.transferencia.UsuarioRespostaDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/turmas")
public class ControladorTurma {

    private final TurmaServico servico;

    public ControladorTurma(TurmaServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public ResponseEntity<List<TurmaRespostaDTO>> listar(@RequestParam(required = false) Long professorId) {
        return ResponseEntity.ok(servico.listar(professorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TurmaRespostaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<TurmaRespostaDTO> cadastrar(@Valid @RequestBody TurmaRequisicaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servico.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TurmaRespostaDTO> editar(@PathVariable Long id, @Valid @RequestBody TurmaRequisicaoDTO dto) {
        return ResponseEntity.ok(servico.editar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> excluir(@PathVariable Long id) {
        servico.excluir(id);
        return ResponseEntity.ok(Map.of("mensagem", "Turma e matrículas associadas excluídas com sucesso."));
    }

    @PatchMapping("/{id}/alternar-status")
    public ResponseEntity<TurmaRespostaDTO> alternarStatus(@PathVariable Long id) {
        return ResponseEntity.ok(servico.alternarStatus(id));
    }

    @GetMapping("/{id}/alunos")
    public ResponseEntity<List<UsuarioRespostaDTO>> listarAlunos(@PathVariable Long id) {
        return ResponseEntity.ok(servico.listarAlunosDaTurma(id));
    }

    @PostMapping("/{turmaId}/alunos/{alunoId}")
    public ResponseEntity<Map<String, String>> matricularAluno(@PathVariable Long turmaId, @PathVariable Long alunoId) {
        servico.matricularAluno(turmaId, alunoId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensagem", "Aluno matriculado com sucesso."));
    }

    @DeleteMapping("/{turmaId}/alunos/{alunoId}")
    public ResponseEntity<Map<String, String>> desmatricularAluno(@PathVariable Long turmaId, @PathVariable Long alunoId) {
        servico.desmatricularAluno(turmaId, alunoId);
        return ResponseEntity.ok(Map.of("mensagem", "Aluno desmatriculado com sucesso."));
    }
}
