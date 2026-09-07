package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Entity
@Table(name = "prontuarios_simulados")
public class ProntuarioSimulado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cenario_id", nullable = false)
    private CenarioClinico cenario;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unidade_hospitalar_id", nullable = false)
    private UnidadeHospitalar unidadeHospitalar;

    @NotBlank
    @Size(max = 50)
    @Column(name = "numero_atendimento", nullable = false, length = 50)
    private String numeroAtendimento;

    @NotNull
    @Column(name = "idade_paciente", nullable = false)
    private Integer idadePaciente;

    @NotNull
    @Column(name = "data_admissao", nullable = false)
    private LocalDate dataAdmissao;

    @NotNull
    @Column(name = "data_alta", nullable = false)
    private LocalDate dataAlta;

    @NotNull
    @Column(name = "tempo_permanencia_dias", nullable = false)
    private Integer tempoPermanenciaDias;

    @NotBlank
    @Column(name = "sumario_alta", nullable = false, columnDefinition = "TEXT")
    private String sumarioAlta;

    @NotBlank
    @Column(name = "prescricoes_medicas", nullable = false, columnDefinition = "TEXT")
    private String prescricoesMedicas;

    @NotBlank
    @Column(name = "exames_laboratoriais", nullable = false, columnDefinition = "TEXT")
    private String examesLaboratoriais;

    @Column(name = "relatorio_cirurgico", columnDefinition = "TEXT")
    private String relatorioCirurgico;

    @NotBlank
    @Column(name = "evolucoes_multiprofissionais", nullable = false, columnDefinition = "TEXT")
    private String evolucoesMultiprofissionais;

    public ProntuarioSimulado() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CenarioClinico getCenario() { return cenario; }
    public void setCenario(CenarioClinico cenario) { this.cenario = cenario; }

    public UnidadeHospitalar getUnidadeHospitalar() { return unidadeHospitalar; }
    public void setUnidadeHospitalar(UnidadeHospitalar unidadeHospitalar) { this.unidadeHospitalar = unidadeHospitalar; }

    public String getNumeroAtendimento() { return numeroAtendimento; }
    public void setNumeroAtendimento(String numeroAtendimento) { this.numeroAtendimento = numeroAtendimento; }

    public Integer getIdadePaciente() { return idadePaciente; }
    public void setIdadePaciente(Integer idadePaciente) { this.idadePaciente = idadePaciente; }

    public LocalDate getDataAdmissao() { return dataAdmissao; }
    public void setDataAdmissao(LocalDate dataAdmissao) { this.dataAdmissao = dataAdmissao; }

    public LocalDate getDataAlta() { return dataAlta; }
    public void setDataAlta(LocalDate dataAlta) { this.dataAlta = dataAlta; }

    public Integer getTempoPermanenciaDias() { return tempoPermanenciaDias; }
    public void setTempoPermanenciaDias(Integer tempoPermanenciaDias) { this.tempoPermanenciaDias = tempoPermanenciaDias; }

    public String getSumarioAlta() { return sumarioAlta; }
    public void setSumarioAlta(String sumarioAlta) { this.sumarioAlta = sumarioAlta; }

    public String getPrescricoesMedicas() { return prescricoesMedicas; }
    public void setPrescricoesMedicas(String prescricoesMedicas) { this.prescricoesMedicas = prescricoesMedicas; }

    public String getExamesLaboratoriais() { return examesLaboratoriais; }
    public void setExamesLaboratoriais(String examesLaboratoriais) { this.examesLaboratoriais = examesLaboratoriais; }

    public String getRelatorioCirurgico() { return relatorioCirurgico; }
    public void setRelatorioCirurgico(String relatorioCirurgico) { this.relatorioCirurgico = relatorioCirurgico; }

    public String getEvolucoesMultiprofissionais() { return evolucoesMultiprofissionais; }
    public void setEvolucoesMultiprofissionais(String evolucoesMultiprofissionais) { this.evolucoesMultiprofissionais = evolucoesMultiprofissionais; }
}
