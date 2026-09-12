package br.ufs.dcomp.sigeagtt.modulos.educacional.modelo;

import br.ufs.dcomp.sigeagtt.modulos.unidade.modelo.UnidadeHospitalar;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "casos_clinicos")
public class CasoClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "professor_criador_id", nullable = false)
    private Usuario professorCriador;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unidade_hospitalar_id", nullable = false)
    private UnidadeHospitalar unidadeHospitalar;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricaoCaso;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String objetivosAprendizagem;

    @Column(nullable = false, length = 50)
    private String numeroAtendimento;

    @Column(nullable = false)
    private Integer idadePaciente;

    @Column(nullable = false)
    private LocalDate dataAdmissao;

    @Column(nullable = false)
    private LocalDate dataAlta;

    @Column(nullable = false)
    private Integer tempoPermanenciaDias;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String sumarioAlta;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String prescricoesMedicas;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String examesLaboratoriais;

    @Column(columnDefinition = "TEXT")
    private String relatorioCirurgico;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String evolucoesMultiprofissionais;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    public CasoClinico() {}

    @PrePersist
    public void prePersist() {
        if (this.criadoEm == null) {
            this.criadoEm = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getProfessorCriador() {
        return professorCriador;
    }

    public void setProfessorCriador(Usuario professorCriador) {
        this.professorCriador = professorCriador;
    }

    public UnidadeHospitalar getUnidadeHospitalar() {
        return unidadeHospitalar;
    }

    public void setUnidadeHospitalar(UnidadeHospitalar unidadeHospitalar) {
        this.unidadeHospitalar = unidadeHospitalar;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricaoCaso() {
        return descricaoCaso;
    }

    public void setDescricaoCaso(String descricaoCaso) {
        this.descricaoCaso = descricaoCaso;
    }

    public String getObjetivosAprendizagem() {
        return objetivosAprendizagem;
    }

    public void setObjetivosAprendizagem(String objetivosAprendizagem) {
        this.objetivosAprendizagem = objetivosAprendizagem;
    }

    public String getNumeroAtendimento() {
        return numeroAtendimento;
    }

    public void setNumeroAtendimento(String numeroAtendimento) {
        this.numeroAtendimento = numeroAtendimento;
    }

    public Integer getIdadePaciente() {
        return idadePaciente;
    }

    public void setIdadePaciente(Integer idadePaciente) {
        this.idadePaciente = idadePaciente;
    }

    public LocalDate getDataAdmissao() {
        return dataAdmissao;
    }

    public void setDataAdmissao(LocalDate dataAdmissao) {
        this.dataAdmissao = dataAdmissao;
    }

    public LocalDate getDataAlta() {
        return dataAlta;
    }

    public void setDataAlta(LocalDate dataAlta) {
        this.dataAlta = dataAlta;
    }

    public Integer getTempoPermanenciaDias() {
        return tempoPermanenciaDias;
    }

    public void setTempoPermanenciaDias(Integer tempoPermanenciaDias) {
        this.tempoPermanenciaDias = tempoPermanenciaDias;
    }

    public String getSumarioAlta() {
        return sumarioAlta;
    }

    public void setSumarioAlta(String sumarioAlta) {
        this.sumarioAlta = sumarioAlta;
    }

    public String getPrescricoesMedicas() {
        return prescricoesMedicas;
    }

    public void setPrescricoesMedicas(String prescricoesMedicas) {
        this.prescricoesMedicas = prescricoesMedicas;
    }

    public String getExamesLaboratoriais() {
        return examesLaboratoriais;
    }

    public void setExamesLaboratoriais(String examesLaboratoriais) {
        this.examesLaboratoriais = examesLaboratoriais;
    }

    public String getRelatorioCirurgico() {
        return relatorioCirurgico;
    }

    public void setRelatorioCirurgico(String relatorioCirurgico) {
        this.relatorioCirurgico = relatorioCirurgico;
    }

    public String getEvolucoesMultiprofissionais() {
        return evolucoesMultiprofissionais;
    }

    public void setEvolucoesMultiprofissionais(String evolucoesMultiprofissionais) {
        this.evolucoesMultiprofissionais = evolucoesMultiprofissionais;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}
