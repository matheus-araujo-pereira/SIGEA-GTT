package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "itens_consenso")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class ItemConsenso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consenso_dupla_id", nullable = false)
    @ToString.Exclude
    private ConsensoDupla consensoDupla;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gatilho_id", nullable = false)
    private GatilhoGtt gatilho;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_ea_id")
    private CategoriaEventoAdverso categoriaEa;

    @NotNull
    @Column(name = "confirmou_dano", nullable = false)
    private Boolean confirmouDano = false;

    @Column(name = "justificativa_dano", columnDefinition = "TEXT")
    private String justificativaDano;

    @NotNull
    @Column(name = "dano_presente_admissao", nullable = false)
    private Boolean danoPresenteAdmissao = false;

    @NotNull
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "gravidade_consenso", columnDefinition = "gravidade_ncc_merp_enum", nullable = false)
    private GravidadeNccMerp gravidadeConsenso;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "gravidade_homologada", columnDefinition = "gravidade_ncc_merp_enum")
    private GravidadeNccMerp gravidadeHomologada;
}
