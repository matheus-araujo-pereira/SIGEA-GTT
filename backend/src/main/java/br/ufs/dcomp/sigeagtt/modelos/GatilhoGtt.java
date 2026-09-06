package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "gatilhos_gtt")
public class GatilhoGtt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 10)
    @Column(name = "codigo", nullable = false, unique = true, length = 10)
    private String codigo;

    @NotNull
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "modulo", nullable = false, columnDefinition = "modulo_gtt_enum")
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

    public GatilhoGtt() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public ModuloGtt getModulo() { return modulo; }
    public void setModulo(ModuloGtt modulo) { this.modulo = modulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getLimiarReferencia() { return limiarReferencia; }
    public void setLimiarReferencia(String limiarReferencia) { this.limiarReferencia = limiarReferencia; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
