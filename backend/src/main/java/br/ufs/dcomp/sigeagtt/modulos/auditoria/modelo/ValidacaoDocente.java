package br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo;

import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "validacoes_docentes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class ValidacaoDocente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "revisao_individual_id", nullable = false, unique = true)
    private RevisaoIndividual revisaoIndividual;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "professor_validador_id", nullable = false)
    private Usuario professorValidador;

    @NotBlank
    @Column(name = "parecer_formativo", nullable = false, columnDefinition = "TEXT")
    private String parecerFormativo;

    @DecimalMin(value = "1.0", message = "A nota mínima é 1.0")
    @DecimalMax(value = "10.0", message = "A nota máxima é 10.0")
    @Column(name = "nota", precision = 4, scale = 2)
    private BigDecimal nota;

    @NotNull
    @Column(name = "homologado", nullable = false)
    private Boolean homologado = false;

    @NotNull
    @Column(name = "data_validacao", nullable = false)
    private LocalDateTime dataValidacao;

    @PrePersist
    protected void aoCriar() {
        if (this.dataValidacao == null)
            this.dataValidacao = LocalDateTime.now();
    }
}
