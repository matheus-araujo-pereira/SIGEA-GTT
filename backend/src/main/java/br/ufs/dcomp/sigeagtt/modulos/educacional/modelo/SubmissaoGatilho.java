package br.ufs.dcomp.sigeagtt.modulos.educacional.modelo;

import br.ufs.dcomp.sigeagtt.modulos.gtt.modelo.GatilhoGtt;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "submissao_gatilhos")
public class SubmissaoGatilho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submissao_id", nullable = false)
    private SubmissaoAtividade submissao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "gatilho_id", nullable = false)
    private GatilhoGtt gatilho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_ea_id")
    private CategoriaEventoAdverso categoriaEa;

    @Column(nullable = false)
    private Boolean confirmouDano = false;

    @Column(columnDefinition = "TEXT")
    private String justificativaDano;

    @Column(nullable = false)
    private Boolean danoPresenteAdmissao = false;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "gravidade", columnDefinition = "gravidade_ncc_merp_enum")
    private GravidadeNccMerp gravidade;

    public SubmissaoGatilho() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SubmissaoAtividade getSubmissao() {
        return submissao;
    }

    public void setSubmissao(SubmissaoAtividade submissao) {
        this.submissao = submissao;
    }

    public GatilhoGtt getGatilho() {
        return gatilho;
    }

    public void setGatilho(GatilhoGtt gatilho) {
        this.gatilho = gatilho;
    }

    public CategoriaEventoAdverso getCategoriaEa() {
        return categoriaEa;
    }

    public void setCategoriaEa(CategoriaEventoAdverso categoriaEa) {
        this.categoriaEa = categoriaEa;
    }

    public Boolean getConfirmouDano() {
        return confirmouDano;
    }

    public void setConfirmouDano(Boolean confirmouDano) {
        this.confirmouDano = confirmouDano;
    }

    public String getJustificativaDano() {
        return justificativaDano;
    }

    public void setJustificativaDano(String justificativaDano) {
        this.justificativaDano = justificativaDano;
    }

    public Boolean getDanoPresenteAdmissao() {
        return danoPresenteAdmissao;
    }

    public void setDanoPresenteAdmissao(Boolean danoPresenteAdmissao) {
        this.danoPresenteAdmissao = danoPresenteAdmissao;
    }

    public GravidadeNccMerp getGravidade() {
        return gravidade;
    }

    public void setGravidade(GravidadeNccMerp gravidade) {
        this.gravidade = gravidade;
    }
}
