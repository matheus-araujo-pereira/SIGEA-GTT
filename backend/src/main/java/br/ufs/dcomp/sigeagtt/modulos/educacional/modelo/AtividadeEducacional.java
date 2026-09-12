package br.ufs.dcomp.sigeagtt.modulos.educacional.modelo;

import br.ufs.dcomp.sigeagtt.modulos.turma.modelo.Turma;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "atividades_educacionais")
public class AtividadeEducacional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "turma_id", nullable = false)
    private Turma turma;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "caso_clinico_id", nullable = false)
    private CasoClinico casoClinico;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String orientacoesPedagogicas;

    @Column(nullable = false)
    private LocalDateTime dataInicio;

    @Column(nullable = false)
    private LocalDateTime dataFim;

    @Column(nullable = false)
    private Integer tempoLimiteMinutos = 20;

    @Column(nullable = false)
    private Boolean ativa = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadaEm;

    public AtividadeEducacional() {}

    @PrePersist
    public void prePersist() {
        if (this.criadaEm == null) {
            this.criadaEm = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Turma getTurma() {
        return turma;
    }

    public void setTurma(Turma turma) {
        this.turma = turma;
    }

    public CasoClinico getCasoClinico() {
        return casoClinico;
    }

    public void setCasoClinico(CasoClinico casoClinico) {
        this.casoClinico = casoClinico;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getOrientacoesPedagogicas() {
        return orientacoesPedagogicas;
    }

    public void setOrientacoesPedagogicas(String orientacoesPedagogicas) {
        this.orientacoesPedagogicas = orientacoesPedagogicas;
    }

    public LocalDateTime getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDateTime dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDateTime getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDateTime dataFim) {
        this.dataFim = dataFim;
    }

    public Integer getTempoLimiteMinutos() {
        return tempoLimiteMinutos;
    }

    public void setTempoLimiteMinutos(Integer tempoLimiteMinutos) {
        this.tempoLimiteMinutos = tempoLimiteMinutos;
    }

    public Boolean getAtiva() {
        return ativa;
    }

    public void setAtiva(Boolean ativa) {
        this.ativa = ativa;
    }

    public LocalDateTime getCriadaEm() {
        return criadaEm;
    }

    public void setCriadaEm(LocalDateTime criadaEm) {
        this.criadaEm = criadaEm;
    }
}
