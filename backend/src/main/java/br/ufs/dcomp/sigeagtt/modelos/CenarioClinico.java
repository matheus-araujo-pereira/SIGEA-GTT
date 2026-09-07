package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cenarios_clinicos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class CenarioClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "professor_criador_id", nullable = false)
    private Usuario professorCriador;

    @NotBlank
    @Size(max = 150)
    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @NotBlank
    @Column(name = "descricao_pedagogica", nullable = false, columnDefinition = "TEXT")
    private String descricaoPedagogica;

    @NotBlank
    @Column(name = "objetivos_aprendizagem", nullable = false, columnDefinition = "TEXT")
    private String objetivosAprendizagem;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void aoCriar() {
        if (this.criadoEm == null) this.criadoEm = LocalDateTime.now();
    }
}
