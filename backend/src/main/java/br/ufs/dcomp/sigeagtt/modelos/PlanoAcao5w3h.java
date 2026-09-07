package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Entity
@Table(name = "planos_acao_5w3h")
public class PlanoAcao5w3h {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consenso_dupla_id", nullable = false)
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

    public PlanoAcao5w3h() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ConsensoDupla getConsensoDupla() { return consensoDupla; }
    public void setConsensoDupla(ConsensoDupla consensoDupla) { this.consensoDupla = consensoDupla; }

    public String getOQue() { return oQue; }
    public void setOQue(String oQue) { this.oQue = oQue; }

    public String getPorQue() { return porQue; }
    public void setPorQue(String porQue) { this.porQue = porQue; }

    public String getQuem() { return quem; }
    public void setQuem(String quem) { this.quem = quem; }

    public String getOnde() { return onde; }
    public void setOnde(String onde) { this.onde = onde; }

    public String getQuando() { return quando; }
    public void setQuando(String quando) { this.quando = quando; }

    public String getComo() { return como; }
    public void setComo(String como) { this.como = como; }

    public BigDecimal getQuantoCusta() { return quantoCusta; }
    public void setQuantoCusta(BigDecimal quantoCusta) { this.quantoCusta = quantoCusta; }

    public String getComoMedir() { return comoMedir; }
    public void setComoMedir(String comoMedir) { this.comoMedir = comoMedir; }
}
