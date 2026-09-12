package br.ufs.dcomp.sigeagtt.modulos.gtt.modelo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "gatilhos_gtt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class GatilhoGtt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank
    @Size(max = 10)
    @Column(name = "codigo", nullable = false, unique = true, length = 10)
    private String codigo;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "modulo_id", nullable = false)
    private ModuloGtt modulo;

    @NotBlank
    @Column(name = "descricao", nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Size(max = 150)
    @Column(name = "limiar_referencia", length = 150)
    private String limiarReferencia;

    @NotNull
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;
}
