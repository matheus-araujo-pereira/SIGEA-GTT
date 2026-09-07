package br.ufs.dcomp.sigeagtt.transferencia;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequisicaoDTO(
    @NotBlank(message = "O e-mail institucional é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    @JsonAlias({"identificador", "email"})
    String email,

    @NotBlank(message = "A senha é obrigatória")
    String senha
) {}
