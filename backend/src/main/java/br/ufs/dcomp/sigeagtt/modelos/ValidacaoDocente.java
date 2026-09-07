package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "validacoes_docentes")
public class ValidacaoDocente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consenso_dupla_id", nullable = false, unique = true)
    private ConsensoDupla consensoDupla;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "professor_validador_id", nullable = false)
    private Usuario professorValidador;

    @NotBlank
    @Column(name = "parecer_formativo", nullable = false, columnDefinition = "TEXT")
    private String parecerFormativo;

    @NotNull
    @Column(name = "homologado", nullable = false)
    private Boolean homologado = false;

    @NotNull
    @Column(name = "data_validacao", nullable = false)
    private LocalDateTime dataValidacao;

    @PrePersist
    protected void aoCriar() {
        if (this.dataValidacao == null) this.dataValidacao = LocalDateTime.now();
    }

    public ValidacaoDocente() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ConsensoDupla getConsensoDupla() { return consensoDupla; }
    public void setConsensoDupla(ConsensoDupla consensoDupla) { this.consensoDupla = consensoDupla; }

    public Usuario getProfessorValidador() { return professorValidador; }
    public void setProfessorValidador(Usuario professorValidador) { this.professorValidador = professorValidador; }

    public String getParecerFormativo() { return parecerFormativo; }
    public void setParecerFormativo(String parecerFormativo) { this.parecerFormativo = parecerFormativo; }

    public Boolean getHomologado() { return homologado; }
    public void setHomologado(Boolean homologado) { this.homologado = homologado; }

    public LocalDateTime getDataValidacao() { return dataValidacao; }
    public void setDataValidacao(LocalDateTime dataValidacao) { this.dataValidacao = dataValidacao; }
}
