package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(
    name = "duplas_revisores",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_dupla_revisores_atividade",
            columnNames = {"atividade_id", "aluno_revisor_1_id", "aluno_revisor_2_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class DuplaRevisores {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "atividade_id", nullable = false)
    private AtividadeAuditoria atividade;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aluno_revisor_1_id", nullable = false)
    private Usuario alunoRevisor1;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aluno_revisor_2_id", nullable = false)
    private Usuario alunoRevisor2;

    @NotNull
    @Column(name = "ativa", nullable = false)
    private Boolean ativa = true;
}
