package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record ProntuarioSimuladoRequisicaoDTO(
    @NotNull(message = "O ID do cenário clínico é obrigatório")
    Long cenarioId,

    @NotNull(message = "A unidade hospitalar de internação é obrigatória")
    Long unidadeHospitalarId,

    @NotBlank(message = "O número de atendimento do prontuário é obrigatório")
    @Size(max = 50, message = "O número de atendimento não pode exceder 50 caracteres")
    String numeroAtendimento,

    @NotNull(message = "A idade do paciente é obrigatória")
    @Positive(message = "A idade deve ser um valor positivo")
    Integer idadePaciente,

    @NotNull(message = "A data de admissão é obrigatória")
    LocalDate dataAdmissao,

    @NotNull(message = "A data de alta é obrigatória")
    LocalDate dataAlta,

    Integer tempoPermanenciaDias,

    @NotBlank(message = "O sumário de alta e códigos diagnósticos são obrigatórios")
    String sumarioAlta,

    @NotBlank(message = "As prescrições médicas são obrigatórias")
    String prescricoesMedicas,

    @NotBlank(message = "Os resultados de exames laboratoriais são obrigatórios")
    String examesLaboratoriais,

    String relatorioCirurgico,

    @NotBlank(message = "As evoluções multiprofissionais são obrigatórias")
    String evolucoesMultiprofissionais
) {
    public ProntuarioSimuladoRequisicaoDTO {
        if (numeroAtendimento != null) numeroAtendimento = numeroAtendimento.trim().toUpperCase();
        if (dataAdmissao != null && dataAlta != null && (tempoPermanenciaDias == null || tempoPermanenciaDias <= 0)) {
            long dias = ChronoUnit.DAYS.between(dataAdmissao, dataAlta);
            tempoPermanenciaDias = (int) Math.max(1, dias);
        }
    }
}
