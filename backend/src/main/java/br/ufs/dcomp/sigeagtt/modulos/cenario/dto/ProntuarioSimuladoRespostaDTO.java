package br.ufs.dcomp.sigeagtt.modulos.cenario.dto;

import br.ufs.dcomp.sigeagtt.modulos.cenario.modelo.ProntuarioSimulado;

import java.time.LocalDate;

public record ProntuarioSimuladoRespostaDTO(
    Long id,
    Long cenarioId,
    String cenarioTitulo,
    Long unidadeHospitalarId,
    String unidadeHospitalarNome,
    String unidadeHospitalarSigla,
    String numeroAtendimento,
    Integer idadePaciente,
    LocalDate dataAdmissao,
    LocalDate dataAlta,
    Integer tempoPermanenciaDias,
    String sumarioAlta,
    String prescricoesMedicas,
    String examesLaboratoriais,
    String relatorioCirurgico,
    String evolucoesMultiprofissionais
) {
    public static ProntuarioSimuladoRespostaDTO deEntidade(ProntuarioSimulado p) {
        return new ProntuarioSimuladoRespostaDTO(
            p.getId(),
            p.getCenario().getId(),
            p.getCenario().getTitulo(),
            p.getUnidadeHospitalar().getId(),
            p.getUnidadeHospitalar().getNome(),
            p.getUnidadeHospitalar().getSigla(),
            p.getNumeroAtendimento(),
            p.getIdadePaciente(),
            p.getDataAdmissao(),
            p.getDataAlta(),
            p.getTempoPermanenciaDias(),
            p.getSumarioAlta(),
            p.getPrescricoesMedicas(),
            p.getExamesLaboratoriais(),
            p.getRelatorioCirurgico(),
            p.getEvolucoesMultiprofissionais()
        );
    }
}
