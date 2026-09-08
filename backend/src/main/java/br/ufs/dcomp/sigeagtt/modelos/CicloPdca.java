package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "ciclos_pdca", uniqueConstraints = {
        @UniqueConstraint(name = "ciclos_pdca_consenso_dupla_id_key", columnNames = { "consenso_dupla_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class CicloPdca {

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
    @Column(name = "planejar", nullable = false, columnDefinition = "TEXT")
    private String planejar;

    @NotBlank
    @Column(name = "fazer", nullable = false, columnDefinition = "TEXT")
    private String fazer;

    @NotBlank
    @Column(name = "checar", nullable = false, columnDefinition = "TEXT")
    private String checar;

    @NotBlank
    @Column(name = "agir", nullable = false, columnDefinition = "TEXT")
    private String agir;
}
