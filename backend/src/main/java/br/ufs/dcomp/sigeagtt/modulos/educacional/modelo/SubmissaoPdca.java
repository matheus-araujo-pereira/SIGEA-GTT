package br.ufs.dcomp.sigeagtt.modulos.educacional.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "submissao_pdca")
public class SubmissaoPdca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submissao_id", nullable = false, unique = true)
    private SubmissaoAtividade submissao;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String planejar;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String fazer;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String checar;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String agir;

    public SubmissaoPdca() {}

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

    public String getPlanejar() {
        return planejar;
    }

    public void setPlanejar(String planejar) {
        this.planejar = planejar;
    }

    public String getFazer() {
        return fazer;
    }

    public void setFazer(String fazer) {
        this.fazer = fazer;
    }

    public String getChecar() {
        return checar;
    }

    public void setChecar(String checar) {
        this.checar = checar;
    }

    public String getAgir() {
        return agir;
    }

    public void setAgir(String agir) {
        this.agir = agir;
    }
}
