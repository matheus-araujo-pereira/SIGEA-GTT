package br.ufs.dcomp.sigeagtt.modulos.educacional.modelo;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "submissao_planos_5w3h")
public class SubmissaoPlano5w3h {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submissao_id", nullable = false)
    private SubmissaoAtividade submissao;

    @Column(name = "o_que", nullable = false, columnDefinition = "TEXT")
    private String oQue;

    @Column(name = "por_que", nullable = false, columnDefinition = "TEXT")
    private String porQue;

    @Column(name = "quem", nullable = false, length = 100)
    private String quem;

    @Column(name = "onde", nullable = false, length = 100)
    private String onde;

    @Column(name = "quando", nullable = false, length = 100)
    private String quando;

    @Column(name = "como", nullable = false, columnDefinition = "TEXT")
    private String como;

    @Column(name = "quanto_custa", precision = 12, scale = 2)
    private BigDecimal quantoCusta;

    @Column(name = "como_medir", length = 150)
    private String comoMedir;

    public SubmissaoPlano5w3h() {}

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

    public String getOQue() {
        return oQue;
    }

    public void setOQue(String oQue) {
        this.oQue = oQue;
    }

    public String getPorQue() {
        return porQue;
    }

    public void setPorQue(String porQue) {
        this.porQue = porQue;
    }

    public String getQuem() {
        return quem;
    }

    public void setQuem(String quem) {
        this.quem = quem;
    }

    public String getOnde() {
        return onde;
    }

    public void setOnde(String onde) {
        this.onde = onde;
    }

    public String getQuando() {
        return quando;
    }

    public void setQuando(String quando) {
        this.quando = quando;
    }

    public String getComo() {
        return como;
    }

    public void setComo(String como) {
        this.como = como;
    }

    public BigDecimal getQuantoCusta() {
        return quantoCusta;
    }

    public void setQuantoCusta(BigDecimal quantoCusta) {
        this.quantoCusta = quantoCusta;
    }

    public String getComoMedir() {
        return comoMedir;
    }

    public void setComoMedir(String comoMedir) {
        this.comoMedir = comoMedir;
    }
}
