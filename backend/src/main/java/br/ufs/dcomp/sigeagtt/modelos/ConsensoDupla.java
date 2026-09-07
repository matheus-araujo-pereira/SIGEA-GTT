package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

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
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class ConsensoDupla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
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
    @ToString.Exclude
    private List<ItemConsenso> itens = new ArrayList<>();

    @OneToOne(mappedBy = "consensoDupla", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private ValidacaoDocente validacaoDocente;

    @PrePersist
    protected void aoCriar() {
        if (this.dataConsenso == null) this.dataConsenso = LocalDateTime.now();
        if (this.submetido == null) this.submetido = false;
    }
}
