package br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo;

import br.ufs.dcomp.sigeagtt.modulos.cenario.modelo.CenarioClinico;
import br.ufs.dcomp.sigeagtt.modulos.turma.modelo.Turma;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "atividades_auditoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class AtividadeAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "turma_id", nullable = false)
    private Turma turma;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cenario_id", nullable = false)
    private CenarioClinico cenario;

    @NotBlank
    @Size(max = 150)
    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @NotNull
    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio;

    @NotNull
    @Column(name = "data_fim", nullable = false)
    private LocalDateTime dataFim;

    @NotNull
    @Column(name = "tempo_limite_minutos", nullable = false)
    private Integer tempoLimiteMinutos = 20;

    @NotNull
    @Column(name = "finalizada", nullable = false)
    private Boolean finalizada = false;
}
