package br.ufs.dcomp.sigeagtt.modulos.turma.modelo;

import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "turma_alunos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class TurmaAluno {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private TurmaAlunoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("turmaId")
    @JoinColumn(name = "turma_id", nullable = false)
    @ToString.Exclude
    private Turma turma;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("alunoId")
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @Column(name = "matriculado_em", nullable = false, updatable = false)
    private LocalDateTime matriculadoEm;

    @PrePersist
    protected void aoMatricular() {
        if (this.matriculadoEm == null) this.matriculadoEm = LocalDateTime.now();
    }

    public TurmaAluno(Turma turma, Usuario aluno) {
        this.id = new TurmaAlunoId(turma.getId(), aluno.getId());
        this.turma = turma;
        this.aluno = aluno;
        this.matriculadoEm = LocalDateTime.now();
    }
}
