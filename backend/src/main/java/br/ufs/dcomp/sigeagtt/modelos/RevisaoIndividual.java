package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "revisoes_individuais",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_revisao_individual",
            columnNames = {"dupla_id", "aluno_id", "prontuario_id"}
        )
    }
)
public class RevisaoIndividual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dupla_id", nullable = false)
    private DuplaRevisores dupla;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "prontuario_id", nullable = false)
    private ProntuarioSimulado prontuario;

    @NotNull
    @Column(name = "tempo_gasto_segundos", nullable = false)
    private Integer tempoGastoSegundos = 0;

    @NotNull
    @Column(name = "finalizada", nullable = false)
    private Boolean finalizada = false;

    @Column(name = "data_submissao")
    private LocalDateTime dataSubmissao;

    @OneToMany(mappedBy = "revisaoIndividual", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AchadoGatilho> achados = new ArrayList<>();

    public RevisaoIndividual() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DuplaRevisores getDupla() { return dupla; }
    public void setDupla(DuplaRevisores dupla) { this.dupla = dupla; }

    public Usuario getAluno() { return aluno; }
    public void setAluno(Usuario aluno) { this.aluno = aluno; }

    public ProntuarioSimulado getProntuario() { return prontuario; }
    public void setProntuario(ProntuarioSimulado prontuario) { this.prontuario = prontuario; }

    public Integer getTempoGastoSegundos() { return tempoGastoSegundos; }
    public void setTempoGastoSegundos(Integer tempoGastoSegundos) { this.tempoGastoSegundos = tempoGastoSegundos; }

    public Boolean getFinalizada() { return finalizada; }
    public void setFinalizada(Boolean finalizada) { this.finalizada = finalizada; }

    public LocalDateTime getDataSubmissao() { return dataSubmissao; }
    public void setDataSubmissao(LocalDateTime dataSubmissao) { this.dataSubmissao = dataSubmissao; }

    public List<AchadoGatilho> getAchados() { return achados; }
    public void setAchados(List<AchadoGatilho> achados) { this.achados = achados; }
}
