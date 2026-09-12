package br.ufs.dcomp.sigeagtt.modulos.qualidade.modelo;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.RevisaoIndividual;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "ciclos_pdca")
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

    @NotNull
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "revisao_individual_id", nullable = false, unique = true)
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
