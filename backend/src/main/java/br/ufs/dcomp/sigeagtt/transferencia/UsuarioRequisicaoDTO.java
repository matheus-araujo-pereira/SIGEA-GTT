package br.ufs.dcomp.sigeagtt.transferencia;

import br.ufs.dcomp.sigeagtt.modelos.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UsuarioRequisicaoDTO(
    @NotBlank(message = "O nome completo é obrigatório")
    @Size(max = 150, message = "O nome não pode exceder 150 caracteres")
    String nomeCompleto,

    @NotBlank(message = "O CPF é obrigatório")
    @Pattern(regexp = "\\d{11}", message = "O CPF deve conter exatamente 11 dígitos numéricos")
    String cpf,

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "O formato de e-mail é inválido")
    String email,

    @NotBlank(message = "O cargo é obrigatório")
    @Size(max = 100, message = "O cargo não pode exceder 100 caracteres")
    String cargo,

    @Pattern(regexp = "\\d{12}", message = "A matrícula SIGAA deve conter exatamente 12 dígitos numéricos")
    String matriculaSigaa,

    @NotNull(message = "O perfil de acesso é obrigatório")
    PerfilUsuario perfil
) {
    public UsuarioRequisicaoDTO {
        if (cpf != null) cpf = cpf.replaceAll("\\D", "");
        if (matriculaSigaa != null && matriculaSigaa.isBlank()) matriculaSigaa = null;
        if (email != null) email = email.trim().toLowerCase();
    }
}
