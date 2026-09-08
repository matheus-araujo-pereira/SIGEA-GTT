package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "analises_ishikawa", uniqueConstraints = {
        @UniqueConstraint(name = "analises_ishikawa_consenso_dupla_id_key", columnNames = { "consenso_dupla_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class AnaliseIshikawa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consenso_dupla_id", unique = true)
    private ConsensoDupla consensoDupla;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "revisao_individual_id", unique = true)
    private RevisaoIndividual revisaoIndividual;

    @NotBlank
    @Column(name = "efeito_principal", nullable = false, columnDefinition = "TEXT")
    private String efeitoPrincipal;

    @Column(name = "metodo", columnDefinition = "TEXT")
    private String metodo;

    @Column(name = "mao_de_obra", columnDefinition = "TEXT")
    private String maoDeObra;

    @Column(name = "material", columnDefinition = "TEXT")
    private String material;

    @Column(name = "medida", columnDefinition = "TEXT")
    private String medida;

    @Column(name = "meio_ambiente", columnDefinition = "TEXT")
    private String meioAmbiente;

    @Column(name = "maquina", columnDefinition = "TEXT")
    private String maquina;
}
