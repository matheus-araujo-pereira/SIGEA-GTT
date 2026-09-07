package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
    name = "ciclos_pdca",
    uniqueConstraints = {
        @UniqueConstraint(name = "ciclos_pdca_consenso_dupla_id_key", columnNames = {"consenso_dupla_id"})
    }
)
public class CicloPdca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consenso_dupla_id", nullable = false, unique = true)
    private ConsensoDupla consensoDupla;

    @NotBlank
    @Column(name = "planejar", nullable = false, columnDefinition = "TEXT")
    private String planejar;

    @NotBlank
    @Column(name = "fazer", nullable = false, columnDefinition = "TEXT")
    private String fazer;

    @NotBlank
    @Column(name = "checar", nullable = false, columnDefinition = "TEXT")
    private String checar;

    @NotBlank
    @Column(name = "agir", nullable = false, columnDefinition = "TEXT")
    private String agir;

    public CicloPdca() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ConsensoDupla getConsensoDupla() { return consensoDupla; }
    public void setConsensoDupla(ConsensoDupla consensoDupla) { this.consensoDupla = consensoDupla; }

    public String getPlanejar() { return planejar; }
    public void setPlanejar(String planejar) { this.planejar = planejar; }

    public String getFazer() { return fazer; }
    public void setFazer(String fazer) { this.fazer = fazer; }

    public String getChecar() { return checar; }
    public void setChecar(String checar) { this.checar = checar; }

    public String getAgir() { return agir; }
    public void setAgir(String agir) { this.agir = agir; }
}
