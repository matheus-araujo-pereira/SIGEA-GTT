package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "turma_alunos")
public class TurmaAluno {

    @EmbeddedId
    private TurmaAlunoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("turmaId")
    @JoinColumn(name = "turma_id", nullable = false)
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

    public TurmaAluno() {}

    public TurmaAluno(Turma turma, Usuario aluno) {
        this.id = new TurmaAlunoId(turma.getId(), aluno.getId());
        this.turma = turma;
        this.aluno = aluno;
        this.matriculadoEm = LocalDateTime.now();
    }

    public TurmaAlunoId getId() { return id; }
    public void setId(TurmaAlunoId id) { this.id = id; }

    public Turma getTurma() { return turma; }
    public void setTurma(Turma turma) { this.turma = turma; }

    public Usuario getAluno() { return aluno; }
    public void setAluno(Usuario aluno) { this.aluno = aluno; }

    public LocalDateTime getMatriculadoEm() { return matriculadoEm; }
    public void setMatriculadoEm(LocalDateTime matriculadoEm) { this.matriculadoEm = matriculadoEm; }
}
