package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "turmas")
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "professor_responsavel_id", nullable = false)
    private Usuario professorResponsavel;

    @NotBlank
    @Size(max = 30)
    @Column(name = "codigo_disciplina", nullable = false, length = 30)
    private String codigoDisciplina;

    @NotBlank
    @Size(max = 20)
    @Column(name = "periodo_letivo", nullable = false, length = 20)
    private String periodoLetivo;

    @NotBlank
    @Size(max = 10)
    @Column(name = "ano_semestre", nullable = false, length = 10)
    private String anoSemestre;

    @NotNull
    @Column(name = "ativa", nullable = false)
    private Boolean ativa = true;

    @Column(name = "criada_em", nullable = false, updatable = false)
    private LocalDateTime criadaEm;

    @PrePersist
    protected void aoCriar() {
        if (this.criadaEm == null) this.criadaEm = LocalDateTime.now();
        if (this.ativa == null) this.ativa = true;
    }

    public Turma() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getProfessorResponsavel() { return professorResponsavel; }
    public void setProfessorResponsavel(Usuario professorResponsavel) { this.professorResponsavel = professorResponsavel; }

    public String getCodigoDisciplina() { return codigoDisciplina; }
    public void setCodigoDisciplina(String codigoDisciplina) { this.codigoDisciplina = codigoDisciplina; }

    public String getPeriodoLetivo() { return periodoLetivo; }
    public void setPeriodoLetivo(String periodoLetivo) { this.periodoLetivo = periodoLetivo; }

    public String getAnoSemestre() { return anoSemestre; }
    public void setAnoSemestre(String anoSemestre) { this.anoSemestre = anoSemestre; }

    public Boolean getAtiva() { return ativa; }
    public void setAtiva(Boolean ativa) { this.ativa = ativa; }

    public LocalDateTime getCriadaEm() { return criadaEm; }
    public void setCriadaEm(LocalDateTime criadaEm) { this.criadaEm = criadaEm; }
}
