package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "revisoes_individuais",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_revisao_individual",
            columnNames = {"dupla_id", "aluno_id", "prontuario_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class RevisaoIndividual {

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
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "prontuario_id", nullable = false)
    private ProntuarioSimulado prontuario;

    @NotNull
    @Column(name = "tempo_gasto_segundos", nullable = false)
    private Integer tempoGastoSegundos = 0;

    @NotNull
    @Column(name = "finalizada", nullable = false)
    private Boolean finalizada = false;

    @Column(name = "data_submissao")
    private LocalDateTime dataSubmissao;

    @OneToMany(mappedBy = "revisaoIndividual", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<AchadoGatilho> achados = new ArrayList<>();
}
