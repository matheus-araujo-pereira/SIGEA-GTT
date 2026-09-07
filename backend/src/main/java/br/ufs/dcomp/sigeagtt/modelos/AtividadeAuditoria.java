package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "atividades_auditoria")
public class AtividadeAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "turma_id", nullable = false)
    private Turma turma;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cenario_id", nullable = false)
    private CenarioClinico cenario;

    @NotBlank
    @Size(max = 150)
    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @NotNull
    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio;

    @NotNull
    @Column(name = "data_fim", nullable = false)
    private LocalDateTime dataFim;

    @NotNull
    @Column(name = "tempo_limite_minutos", nullable = false)
    private Integer tempoLimiteMinutos = 20;

    @NotNull
    @Column(name = "finalizada", nullable = false)
    private Boolean finalizada = false;

    public AtividadeAuditoria() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Turma getTurma() { return turma; }
    public void setTurma(Turma turma) { this.turma = turma; }

    public CenarioClinico getCenario() { return cenario; }
    public void setCenario(CenarioClinico cenario) { this.cenario = cenario; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public LocalDateTime getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDateTime dataInicio) { this.dataInicio = dataInicio; }

    public LocalDateTime getDataFim() { return dataFim; }
    public void setDataFim(LocalDateTime dataFim) { this.dataFim = dataFim; }

    public Integer getTempoLimiteMinutos() { return tempoLimiteMinutos; }
    public void setTempoLimiteMinutos(Integer tempoLimiteMinutos) { this.tempoLimiteMinutos = tempoLimiteMinutos; }

    public Boolean getFinalizada() { return finalizada; }
    public void setFinalizada(Boolean finalizada) { this.finalizada = finalizada; }
}
