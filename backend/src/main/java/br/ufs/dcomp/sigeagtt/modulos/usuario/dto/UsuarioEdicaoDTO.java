package br.ufs.dcomp.sigeagtt.modulos.usuario.dto;

import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UsuarioEdicaoDTO(
        @NotBlank(message = "O nome completo é obrigatório")
                @Size(max = 150, message = "O nome não pode exceder 150 caracteres")
                String nomeCompleto,
        @NotBlank(message = "O e-mail institucional é obrigatório")
                @Email(message = "O formato de e-mail é inválido")
                @Pattern(
                        regexp = "^[A-Za-z0-9._%+-]+@academico\\.ufs\\.br$",
                        message =
                                "O e-mail deve pertencer obrigatoriamente ao domínio @academico.ufs.br")
                String email,
        @Pattern(
                        regexp = "^(\\d{12})?$",
                        message = "A matrícula SIGAA deve conter exatamente 12 dígitos numéricos")
                String matriculaSigaa,
        @NotNull(message = "O perfil de acesso é obrigatório") PerfilUsuario perfil) {}
