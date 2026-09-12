package br.ufs.dcomp.sigeagtt.modulos.educacional.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "submissao_ishikawa")
public class SubmissaoIshikawa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submissao_id", nullable = false, unique = true)
    private SubmissaoAtividade submissao;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String efeitoPrincipal;

    @Column(columnDefinition = "TEXT")
    private String metodo;

    @Column(columnDefinition = "TEXT")
    private String maoDeObra;

    @Column(columnDefinition = "TEXT")
    private String material;

    @Column(columnDefinition = "TEXT")
    private String medida;

    @Column(columnDefinition = "TEXT")
    private String meioAmbiente;

    @Column(columnDefinition = "TEXT")
    private String maquina;

    public SubmissaoIshikawa() {}

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

    public String getEfeitoPrincipal() {
        return efeitoPrincipal;
    }

    public void setEfeitoPrincipal(String efeitoPrincipal) {
        this.efeitoPrincipal = efeitoPrincipal;
    }

    public String getMetodo() {
        return metodo;
    }

    public void setMetodo(String metodo) {
        this.metodo = metodo;
    }

    public String getMaoDeObra() {
        return maoDeObra;
    }

    public void setMaoDeObra(String maoDeObra) {
        this.maoDeObra = maoDeObra;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public String getMedida() {
        return medida;
    }

    public void setMedida(String medida) {
        this.medida = medida;
    }

    public String getMeioAmbiente() {
        return meioAmbiente;
    }

    public void setMeioAmbiente(String meioAmbiente) {
        this.meioAmbiente = meioAmbiente;
    }

    public String getMaquina() {
        return maquina;
    }

    public void setMaquina(String maquina) {
        this.maquina = maquina;
    }
}
