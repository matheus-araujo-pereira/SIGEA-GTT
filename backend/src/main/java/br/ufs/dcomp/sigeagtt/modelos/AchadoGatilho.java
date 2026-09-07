package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "achados_gatilhos")
public class AchadoGatilho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revisao_individual_id", nullable = false)
    private RevisaoIndividual revisaoIndividual;

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

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "gravidade", columnDefinition = "gravidade_ncc_merp_enum")
    private GravidadeNccMerp gravidade;

    public AchadoGatilho() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RevisaoIndividual getRevisaoIndividual() { return revisaoIndividual; }
    public void setRevisaoIndividual(RevisaoIndividual revisaoIndividual) { this.revisaoIndividual = revisaoIndividual; }

    public GatilhoGtt getGatilho() { return gatilho; }
    public void setGatilho(GatilhoGtt gatilho) { this.gatilho = gatilho; }

    public CategoriaEventoAdverso getCategoriaEa() { return categoriaEa; }
    public void setCategoriaEa(CategoriaEventoAdverso categoriaEa) { this.categoriaEa = categoriaEa; }

    public Boolean getConfirmouDano() { return confirmouDano; }
    public void setConfirmouDano(Boolean confirmouDano) { this.confirmouDano = confirmouDano; }

    public String getJustificativaDano() { return justificativaDano; }
    public void setJustificativaDano(String justificativaDano) { this.justificativaDano = justificativaDano; }

    public Boolean getDanoPresenteAdmissao() { return danoPresenteAdmissao; }
    public void setDanoPresenteAdmissao(Boolean danoPresenteAdmissao) { this.danoPresenteAdmissao = danoPresenteAdmissao; }

    public GravidadeNccMerp getGravidade() { return gravidade; }
    public void setGravidade(GravidadeNccMerp gravidade) { this.gravidade = gravidade; }
}
