package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "planos_acao_5w3h")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class PlanoAcao5w3h {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consenso_dupla_id", nullable = false)
    @ToString.Exclude
    private ConsensoDupla consensoDupla;

    @NotBlank
    @Column(name = "o_que", nullable = false, columnDefinition = "TEXT")
    private String oQue;

    @NotBlank
    @Column(name = "por_que", nullable = false, columnDefinition = "TEXT")
    private String porQue;

    @NotBlank
    @Size(max = 100)
    @Column(name = "quem", nullable = false, length = 100)
    private String quem;

    @NotBlank
    @Size(max = 100)
    @Column(name = "onde", nullable = false, length = 100)
    private String onde;

    @NotBlank
    @Size(max = 100)
    @Column(name = "quando", nullable = false, length = 100)
    private String quando;

    @NotBlank
    @Column(name = "como", nullable = false, columnDefinition = "TEXT")
    private String como;

    @Column(name = "quanto_custa", precision = 12, scale = 2)
    private BigDecimal quantoCusta;

    @Size(max = 150)
    @Column(name = "como_medir", length = 150)
    private String comoMedir;
}
