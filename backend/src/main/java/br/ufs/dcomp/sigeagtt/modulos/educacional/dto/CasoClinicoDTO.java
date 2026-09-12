package br.ufs.dcomp.sigeagtt.modulos.educacional.dto;

import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.CasoClinico;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CasoClinicoDTO(
        Long id,
        Long professorCriadorId,
        String professorCriadorNome,
        Long unidadeHospitalarId,
        String unidadeHospitalarNome,
        String unidadeHospitalarSigla,
        String titulo,
        String descricaoCaso,
        String objetivosAprendizagem,
        String numeroAtendimento,
        Integer idadePaciente,
        LocalDate dataAdmissao,
        LocalDate dataAlta,
        Integer tempoPermanenciaDias,
        String sumarioAlta,
        String prescricoesMedicas,
        String examesLaboratoriais,
        String relatorioCirurgico,
        String evolucoesMultiprofissionais,
        LocalDateTime criadoEm) {
    public static CasoClinicoDTO deEntidade(CasoClinico c) {
        return new CasoClinicoDTO(
                c.getId(),
                c.getProfessorCriador() != null ? c.getProfessorCriador().getId() : null,
                c.getProfessorCriador() != null ? c.getProfessorCriador().getNomeCompleto() : null,
                c.getUnidadeHospitalar() != null ? c.getUnidadeHospitalar().getId() : null,
                c.getUnidadeHospitalar() != null ? c.getUnidadeHospitalar().getNome() : null,
                c.getUnidadeHospitalar() != null ? c.getUnidadeHospitalar().getSigla() : null,
                c.getTitulo(),
                c.getDescricaoCaso(),
                c.getObjetivosAprendizagem(),
                c.getNumeroAtendimento(),
                c.getIdadePaciente(),
                c.getDataAdmissao(),
                c.getDataAlta(),
                c.getTempoPermanenciaDias(),
                c.getSumarioAlta(),
                c.getPrescricoesMedicas(),
                c.getExamesLaboratoriais(),
                c.getRelatorioCirurgico(),
                c.getEvolucoesMultiprofissionais(),
                c.getCriadoEm());
    }
}
