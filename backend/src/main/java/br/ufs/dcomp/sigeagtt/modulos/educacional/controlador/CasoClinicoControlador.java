package br.ufs.dcomp.sigeagtt.modulos.educacional.controlador;

import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.CasoClinicoDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.SalvarCasoClinicoDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.servico.CasoClinicoServico;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/casos-clinicos")
public class CasoClinicoControlador {

    private final CasoClinicoServico casoServico;

    public CasoClinicoControlador(CasoClinicoServico casoServico) {
        this.casoServico = casoServico;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'PROFESSOR')")
    public ResponseEntity<List<CasoClinicoDTO>> listar(@AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(casoServico.listar(usuarioLogado));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'PROFESSOR', 'ALUNO')")
    public ResponseEntity<CasoClinicoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(casoServico.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'PROFESSOR')")
    public ResponseEntity<CasoClinicoDTO> criar(
            @Valid @RequestBody SalvarCasoClinicoDTO dto,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        CasoClinicoDTO criado = casoServico.salvar(dto, usuarioLogado);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'PROFESSOR')")
    public ResponseEntity<CasoClinicoDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody SalvarCasoClinicoDTO dto,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(casoServico.atualizar(id, dto, usuarioLogado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'PROFESSOR')")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        casoServico.excluir(id, usuarioLogado);
        return ResponseEntity.noContent().build();
    }
}
