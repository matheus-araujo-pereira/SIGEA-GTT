package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

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
public class DuplaRevisores {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    public DuplaRevisores() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AtividadeAuditoria getAtividade() { return atividade; }
    public void setAtividade(AtividadeAuditoria atividade) { this.atividade = atividade; }

    public Usuario getAlunoRevisor1() { return alunoRevisor1; }
    public void setAlunoRevisor1(Usuario alunoRevisor1) { this.alunoRevisor1 = alunoRevisor1; }

    public Usuario getAlunoRevisor2() { return alunoRevisor2; }
    public void setAlunoRevisor2(Usuario alunoRevisor2) { this.alunoRevisor2 = alunoRevisor2; }

    public Boolean getAtiva() { return ativa; }
    public void setAtiva(Boolean ativa) { this.ativa = ativa; }
}
