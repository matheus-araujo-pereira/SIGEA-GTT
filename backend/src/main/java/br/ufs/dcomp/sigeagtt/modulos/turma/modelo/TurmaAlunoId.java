package br.ufs.dcomp.sigeagtt.modulos.turma.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
public class TurmaAlunoId implements Serializable {

    @Column(name = "turma_id")
    private Long turmaId;

    @Column(name = "aluno_id")
    private Long alunoId;
}
