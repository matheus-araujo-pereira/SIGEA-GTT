package br.ufs.dcomp.sigeagtt.modulos.turma.controlador;

import br.ufs.dcomp.sigeagtt.modulos.turma.dto.TurmaRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.turma.dto.TurmaRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.turma.servico.TurmaServico;
import br.ufs.dcomp.sigeagtt.modulos.usuario.dto.UsuarioRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/turmas")
public class TurmaControlador {

    private final TurmaServico servico;

    public TurmaControlador(TurmaServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public ResponseEntity<List<TurmaRespostaDTO>> listar(
            @RequestParam(required = false) Long professorId,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        Long filtroProfId = professorId;
        if (usuarioLogado != null && usuarioLogado.getPerfil() == PerfilUsuario.PROFESSOR) {
            filtroProfId = usuarioLogado.getId();
        }
        return ResponseEntity.ok(servico.listar(filtroProfId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TurmaRespostaDTO> buscarPorId(
            @PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {
        TurmaRespostaDTO dto = servico.buscarPorId(id);
        if (usuarioLogado != null && usuarioLogado.getPerfil() == PerfilUsuario.PROFESSOR) {
            if (dto.professorResponsavelId() != null
                    && !dto.professorResponsavelId().equals(usuarioLogado.getId())) {
                throw new AccessDeniedException("Acesso não autorizado a esta turma.");
            }
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<TurmaRespostaDTO> cadastrar(
            @Valid @RequestBody TurmaRequisicaoDTO dto,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        if (usuarioLogado != null && usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR) {
            throw new AccessDeniedException("Apenas administradores podem cadastrar turmas.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(servico.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TurmaRespostaDTO> editar(
            @PathVariable Long id,
            @Valid @RequestBody TurmaRequisicaoDTO dto,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        if (usuarioLogado != null && usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR) {
            throw new AccessDeniedException("Apenas administradores podem editar turmas.");
        }
        return ResponseEntity.ok(servico.editar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> excluir(
            @PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {
        if (usuarioLogado != null && usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR) {
            throw new AccessDeniedException("Apenas administradores podem excluir turmas.");
        }
        servico.excluir(id);
        return ResponseEntity.ok(
                Map.of("mensagem", "Turma e matrículas associadas excluídas com sucesso."));
    }

    @PatchMapping("/{id}/alternar-status")
    public ResponseEntity<TurmaRespostaDTO> alternarStatus(
            @PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {
        if (usuarioLogado != null && usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR) {
            throw new AccessDeniedException(
                    "Apenas administradores podem alterar o status da turma.");
        }
        return ResponseEntity.ok(servico.alternarStatus(id));
    }

    @GetMapping("/{id}/alunos")
    public ResponseEntity<List<UsuarioRespostaDTO>> listarAlunos(
            @PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {
        if (usuarioLogado != null && usuarioLogado.getPerfil() == PerfilUsuario.PROFESSOR) {
            TurmaRespostaDTO turma = servico.buscarPorId(id);
            if (turma.professorResponsavelId() != null
                    && !turma.professorResponsavelId().equals(usuarioLogado.getId())) {
                throw new AccessDeniedException("Acesso não autorizado aos alunos desta turma.");
            }
        }
        return ResponseEntity.ok(servico.listarAlunosDaTurma(id));
    }

    @PostMapping("/{turmaId}/alunos/{alunoId}")
    public ResponseEntity<Map<String, String>> matricularAluno(
            @PathVariable Long turmaId,
            @PathVariable Long alunoId,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        if (usuarioLogado != null && usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR) {
            throw new AccessDeniedException(
                    "Apenas administradores podem matricular alunos em turmas.");
        }
        servico.matricularAluno(turmaId, alunoId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensagem", "Aluno matriculado com sucesso."));
    }

    @DeleteMapping("/{turmaId}/alunos/{alunoId}")
    public ResponseEntity<Map<String, String>> desmatricularAluno(
            @PathVariable Long turmaId,
            @PathVariable Long alunoId,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        if (usuarioLogado != null && usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR) {
            throw new AccessDeniedException(
                    "Apenas administradores podem desmatricular alunos de turmas.");
        }
        servico.desmatricularAluno(turmaId, alunoId);
        return ResponseEntity.ok(Map.of("mensagem", "Aluno desmatriculado com sucesso."));
    }
}
