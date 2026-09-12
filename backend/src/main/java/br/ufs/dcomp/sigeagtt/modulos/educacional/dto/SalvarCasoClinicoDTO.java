package br.ufs.dcomp.sigeagtt.modulos.educacional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record SalvarCasoClinicoDTO(
    @NotNull Long unidadeHospitalarId,
    @NotBlank String titulo,
    @NotBlank String descricaoCaso,
    @NotBlank String objetivosAprendizagem,
    @NotBlank String numeroAtendimento,
    @NotNull Integer idadePaciente,
    @NotNull LocalDate dataAdmissao,
    @NotNull LocalDate dataAlta,
    @NotNull Integer tempoPermanenciaDias,
    @NotBlank String sumarioAlta,
    @NotBlank String prescricoesMedicas,
    @NotBlank String examesLaboratoriais,
    String relatorioCirurgico,
    @NotBlank String evolucoesMultiprofissionais
) {}
