package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
    name = "analises_ishikawa",
    uniqueConstraints = {
        @UniqueConstraint(name = "analises_ishikawa_consenso_dupla_id_key", columnNames = {"consenso_dupla_id"})
    }
)
public class AnaliseIshikawa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consenso_dupla_id", nullable = false, unique = true)
    private ConsensoDupla consensoDupla;

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

    public AnaliseIshikawa() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ConsensoDupla getConsensoDupla() { return consensoDupla; }
    public void setConsensoDupla(ConsensoDupla consensoDupla) { this.consensoDupla = consensoDupla; }

    public String getEfeitoPrincipal() { return efeitoPrincipal; }
    public void setEfeitoPrincipal(String efeitoPrincipal) { this.efeitoPrincipal = efeitoPrincipal; }

    public String getMetodo() { return metodo; }
    public void setMetodo(String metodo) { this.metodo = metodo; }

    public String getMaoDeObra() { return maoDeObra; }
    public void setMaoDeObra(String maoDeObra) { this.maoDeObra = maoDeObra; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getMedida() { return medida; }
    public void setMedida(String medida) { this.medida = medida; }

    public String getMeioAmbiente() { return meioAmbiente; }
    public void setMeioAmbiente(String meioAmbiente) { this.meioAmbiente = meioAmbiente; }

    public String getMaquina() { return maquina; }
    public void setMaquina(String maquina) { this.maquina = maquina; }
}
