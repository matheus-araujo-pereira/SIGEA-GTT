package br.ufs.dcomp.sigeagtt.modulos.qualidade.modelo;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.RevisaoIndividual;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "analises_ishikawa")
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

    @NotNull
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "revisao_individual_id", nullable = false, unique = true)
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
