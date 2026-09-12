package br.ufs.dcomp.sigeagtt.modulos.unidade.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UnidadeHospitalarRequisicaoDTO(
    @NotBlank(message = "A sigla da unidade é obrigatória")
    @Size(max = 20, message = "A sigla não pode exceder 20 caracteres")
    String sigla,

    @NotBlank(message = "O nome da unidade é obrigatório")
    @Size(max = 100, message = "O nome não pode exceder 100 caracteres")
    String nome
) {}
