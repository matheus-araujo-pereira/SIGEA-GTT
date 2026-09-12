package br.ufs.dcomp.sigeagtt.modulos.educacional.controlador;

import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.AvaliarSubmissaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.MinhaAtividadeItemDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.SalvarSubmissaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.SubmissaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.CategoriaEventoAdverso;
import br.ufs.dcomp.sigeagtt.modulos.educacional.servico.SubmissaoAtividadeServico;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissoes")
public class SubmissaoAtividadeControlador {

    private final SubmissaoAtividadeServico submissaoServico;

    public SubmissaoAtividadeControlador(SubmissaoAtividadeServico submissaoServico) {
        this.submissaoServico = submissaoServico;
    }

    @GetMapping("/minhas")
    @PreAuthorize("hasAnyRole('ALUNO', 'ADMINISTRADOR')")
    public ResponseEntity<List<MinhaAtividadeItemDTO>> listarMinhasAtividades(
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(submissaoServico.listarMinhasAtividades(usuarioLogado));
    }

    @PostMapping("/iniciar/{atividadeId}")
    @PreAuthorize("hasAnyRole('ALUNO', 'ADMINISTRADOR')")
    public ResponseEntity<SubmissaoDTO> iniciarOuContinuar(
            @PathVariable Long atividadeId,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(submissaoServico.iniciarOuContinuar(atividadeId, usuarioLogado));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ALUNO', 'PROFESSOR', 'ADMINISTRADOR')")
    public ResponseEntity<SubmissaoDTO> buscarPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(submissaoServico.buscarSubmissao(id, usuarioLogado));
    }

    @PutMapping("/{id}/progresso")
    @PreAuthorize("hasAnyRole('ALUNO', 'ADMINISTRADOR')")
    public ResponseEntity<SubmissaoDTO> salvarProgresso(
            @PathVariable Long id,
            @RequestBody SalvarSubmissaoDTO dto,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(submissaoServico.salvarProgresso(id, dto, usuarioLogado));
    }

    @PostMapping("/{id}/avaliar")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'ADMINISTRADOR')")
    public ResponseEntity<SubmissaoDTO> avaliar(
            @PathVariable Long id,
            @Valid @RequestBody AvaliarSubmissaoDTO dto,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(submissaoServico.avaliar(id, dto, usuarioLogado));
    }

    @GetMapping("/pendentes")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'ADMINISTRADOR')")
    public ResponseEntity<List<SubmissaoDTO>> listarPendentes(
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(submissaoServico.listarPendentesCorrecao(usuarioLogado));
    }

    @GetMapping("/categorias-ea")
    public ResponseEntity<List<CategoriaEventoAdverso>> listarCategorias() {
        return ResponseEntity.ok(submissaoServico.listarCategoriasAtivas());
    }
}
