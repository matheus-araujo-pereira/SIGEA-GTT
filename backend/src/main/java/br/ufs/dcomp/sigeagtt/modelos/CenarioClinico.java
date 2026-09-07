package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "cenarios_clinicos")
public class CenarioClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "professor_criador_id", nullable = false)
    private Usuario professorCriador;

    @NotBlank
    @Size(max = 150)
    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @NotBlank
    @Column(name = "descricao_pedagogica", nullable = false, columnDefinition = "TEXT")
    private String descricaoPedagogica;

    @NotBlank
    @Column(name = "objetivos_aprendizagem", nullable = false, columnDefinition = "TEXT")
    private String objetivosAprendizagem;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void aoCriar() {
        if (this.criadoEm == null) this.criadoEm = LocalDateTime.now();
    }

    public CenarioClinico() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getProfessorCriador() { return professorCriador; }
    public void setProfessorCriador(Usuario professorCriador) { this.professorCriador = professorCriador; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricaoPedagogica() { return descricaoPedagogica; }
    public void setDescricaoPedagogica(String descricaoPedagogica) { this.descricaoPedagogica = descricaoPedagogica; }

    public String getObjetivosAprendizagem() { return objetivosAprendizagem; }
    public void setObjetivosAprendizagem(String objetivosAprendizagem) { this.objetivosAprendizagem = objetivosAprendizagem; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
