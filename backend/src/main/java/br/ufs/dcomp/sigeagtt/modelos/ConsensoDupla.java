package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "consensos_duplas",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_consenso_dupla", columnNames = {"dupla_id", "prontuario_id"})
    }
)
public class ConsensoDupla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dupla_id", nullable = false)
    private DuplaRevisores dupla;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "prontuario_id", nullable = false)
    private ProntuarioSimulado prontuario;

    @NotNull
    @Column(name = "data_consenso", nullable = false)
    private LocalDateTime dataConsenso;

    @NotNull
    @Column(name = "submetido", nullable = false)
    private Boolean submetido = false;

    @OneToMany(mappedBy = "consensoDupla", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ItemConsenso> itens = new ArrayList<>();

    @OneToOne(mappedBy = "consensoDupla", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ValidacaoDocente validacaoDocente;

    @PrePersist
    protected void aoCriar() {
        if (this.dataConsenso == null) this.dataConsenso = LocalDateTime.now();
        if (this.submetido == null) this.submetido = false;
    }

    public ConsensoDupla() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DuplaRevisores getDupla() { return dupla; }
    public void setDupla(DuplaRevisores dupla) { this.dupla = dupla; }

    public ProntuarioSimulado getProntuario() { return prontuario; }
    public void setProntuario(ProntuarioSimulado prontuario) { this.prontuario = prontuario; }

    public LocalDateTime getDataConsenso() { return dataConsenso; }
    public void setDataConsenso(LocalDateTime dataConsenso) { this.dataConsenso = dataConsenso; }

    public Boolean getSubmetido() { return submetido; }
    public void setSubmetido(Boolean submetido) { this.submetido = submetido; }

    public List<ItemConsenso> getItens() { return itens; }
    public void setItens(List<ItemConsenso> itens) { this.itens = itens; }

    public ValidacaoDocente getValidacaoDocente() { return validacaoDocente; }
    public void setValidacaoDocente(ValidacaoDocente validacaoDocente) { this.validacaoDocente = validacaoDocente; }
}
