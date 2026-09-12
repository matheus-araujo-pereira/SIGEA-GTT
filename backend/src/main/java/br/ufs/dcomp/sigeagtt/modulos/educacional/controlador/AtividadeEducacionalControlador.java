package br.ufs.dcomp.sigeagtt.modulos.educacional.controlador;

import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.AtividadeEducacionalDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.PainelAtividadeDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.SalvarAtividadeDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.servico.AtividadeEducacionalServico;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atividades-educacionais")
public class AtividadeEducacionalControlador {

    private final AtividadeEducacionalServico atividadeServico;

    public AtividadeEducacionalControlador(AtividadeEducacionalServico atividadeServico) {
        this.atividadeServico = atividadeServico;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'PROFESSOR')")
    public ResponseEntity<List<AtividadeEducacionalDTO>> listar(@AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(atividadeServico.listar(usuarioLogado));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'PROFESSOR', 'ALUNO')")
    public ResponseEntity<AtividadeEducacionalDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(atividadeServico.buscarPorId(id));
    }

    @GetMapping("/{id}/painel")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'PROFESSOR')")
    public ResponseEntity<PainelAtividadeDTO> buscarPainel(
        @PathVariable Long id,
        @AuthenticationPrincipal Usuario usuarioLogado
    ) {
        return ResponseEntity.ok(atividadeServico.buscarPainelAtividade(id, usuarioLogado));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'PROFESSOR')")
    public ResponseEntity<AtividadeEducacionalDTO> criar(
        @Valid @RequestBody SalvarAtividadeDTO dto,
        @AuthenticationPrincipal Usuario usuarioLogado
    ) {
        AtividadeEducacionalDTO criada = atividadeServico.salvar(dto, usuarioLogado);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'PROFESSOR')")
    public ResponseEntity<AtividadeEducacionalDTO> atualizar(
        @PathVariable Long id,
        @Valid @RequestBody SalvarAtividadeDTO dto,
        @AuthenticationPrincipal Usuario usuarioLogado
    ) {
        return ResponseEntity.ok(atividadeServico.atualizar(id, dto, usuarioLogado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'PROFESSOR')")
    public ResponseEntity<Void> excluir(
        @PathVariable Long id,
        @AuthenticationPrincipal Usuario usuarioLogado
    ) {
        atividadeServico.excluir(id, usuarioLogado);
        return ResponseEntity.noContent().build();
    }
}
