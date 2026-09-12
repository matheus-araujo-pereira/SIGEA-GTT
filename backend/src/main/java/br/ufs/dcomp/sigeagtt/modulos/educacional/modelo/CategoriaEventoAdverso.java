package br.ufs.dcomp.sigeagtt.modulos.educacional.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "categorias_eventos_adversos")
public class CategoriaEventoAdverso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nome;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String definicaoOperacional;

    @Column(nullable = false)
    private Boolean ativa = true;

    public CategoriaEventoAdverso() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDefinicaoOperacional() {
        return definicaoOperacional;
    }

    public void setDefinicaoOperacional(String definicaoOperacional) {
        this.definicaoOperacional = definicaoOperacional;
    }

    public Boolean getAtiva() {
        return ativa;
    }

    public void setAtiva(Boolean ativa) {
        this.ativa = ativa;
    }
}
