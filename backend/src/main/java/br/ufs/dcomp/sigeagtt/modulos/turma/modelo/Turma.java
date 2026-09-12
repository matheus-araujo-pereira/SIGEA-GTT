package br.ufs.dcomp.sigeagtt.modulos.turma.modelo;

import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "turmas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "professor_responsavel_id", nullable = false)
    private Usuario professorResponsavel;

    @NotBlank
    @Size(max = 30)
    @Column(name = "codigo_disciplina", nullable = false, length = 30)
    private String codigoDisciplina;

    @NotBlank
    @Size(max = 20)
    @Column(name = "periodo_letivo", nullable = false, length = 20)
    private String periodoLetivo;

    @NotBlank
    @Size(max = 10)
    @Column(name = "ano_semestre", nullable = false, length = 10)
    private String anoSemestre;

    @NotNull
    @Column(name = "ativa", nullable = false)
    private Boolean ativa = true;

    @Column(name = "criada_em", nullable = false, updatable = false)
    private LocalDateTime criadaEm;

    @PrePersist
    protected void aoCriar() {
        if (this.criadaEm == null) this.criadaEm = LocalDateTime.now();
        if (this.ativa == null) this.ativa = true;
    }
}
