package br.ufs.dcomp.sigeagtt.modulos.educacional.modelo;

import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(
        name = "submissoes_atividades",
        uniqueConstraints = {
            @UniqueConstraint(
                    name = "uq_submissao_aluno_atividade",
                    columnNames = {"atividade_id", "aluno_id"})
        })
public class SubmissaoAtividade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "atividade_id", nullable = false)
    private AtividadeEducacional atividade;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false, columnDefinition = "status_submissao_enum")
    private StatusSubmissao status = StatusSubmissao.EM_ANDAMENTO;

    @Column(nullable = false)
    private Integer tempoGastoSegundos = 0;

    @Column(nullable = false)
    private LocalDateTime dataInicio;

    private LocalDateTime dataSubmissao;

    // Avaliação Docente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_corretor_id")
    private Usuario professorCorretor;

    @Column(precision = 4, scale = 2)
    private BigDecimal nota;

    @Column(columnDefinition = "TEXT")
    private String parecerDocente;

    private LocalDateTime dataAvaliacao;

    // Relacionamentos com os 4 Componentes da Resolução
    @OneToMany(mappedBy = "submissao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubmissaoGatilho> achadosGatilhos = new ArrayList<>();

    @OneToOne(mappedBy = "submissao", cascade = CascadeType.ALL, orphanRemoval = true)
    private SubmissaoIshikawa ishikawa;

    @OneToMany(mappedBy = "submissao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubmissaoPlano5w3h> planos5w3h = new ArrayList<>();

    @OneToOne(mappedBy = "submissao", cascade = CascadeType.ALL, orphanRemoval = true)
    private SubmissaoPdca pdca;

    public SubmissaoAtividade() {}

    @PrePersist
    public void prePersist() {
        if (this.dataInicio == null) {
            this.dataInicio = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = StatusSubmissao.EM_ANDAMENTO;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AtividadeEducacional getAtividade() {
        return atividade;
    }

    public void setAtividade(AtividadeEducacional atividade) {
        this.atividade = atividade;
    }

    public Usuario getAluno() {
        return aluno;
    }

    public void setAluno(Usuario aluno) {
        this.aluno = aluno;
    }

    public StatusSubmissao getStatus() {
        return status;
    }

    public void setStatus(StatusSubmissao status) {
        this.status = status;
    }

    public Integer getTempoGastoSegundos() {
        return tempoGastoSegundos;
    }

    public void setTempoGastoSegundos(Integer tempoGastoSegundos) {
        this.tempoGastoSegundos = tempoGastoSegundos;
    }

    public LocalDateTime getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDateTime dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDateTime getDataSubmissao() {
        return dataSubmissao;
    }

    public void setDataSubmissao(LocalDateTime dataSubmissao) {
        this.dataSubmissao = dataSubmissao;
    }

    public Usuario getProfessorCorretor() {
        return professorCorretor;
    }

    public void setProfessorCorretor(Usuario professorCorretor) {
        this.professorCorretor = professorCorretor;
    }

    public BigDecimal getNota() {
        return nota;
    }

    public void setNota(BigDecimal nota) {
        this.nota = nota;
    }

    public String getParecerDocente() {
        return parecerDocente;
    }

    public void setParecerDocente(String parecerDocente) {
        this.parecerDocente = parecerDocente;
    }

    public LocalDateTime getDataAvaliacao() {
        return dataAvaliacao;
    }

    public void setDataAvaliacao(LocalDateTime dataAvaliacao) {
        this.dataAvaliacao = dataAvaliacao;
    }

    public List<SubmissaoGatilho> getAchadosGatilhos() {
        return achadosGatilhos;
    }

    public void setAchadosGatilhos(List<SubmissaoGatilho> achadosGatilhos) {
        this.achadosGatilhos = achadosGatilhos;
    }

    public SubmissaoIshikawa getIshikawa() {
        return ishikawa;
    }

    public void setIshikawa(SubmissaoIshikawa ishikawa) {
        this.ishikawa = ishikawa;
        if (ishikawa != null) {
            ishikawa.setSubmissao(this);
        }
    }

    public List<SubmissaoPlano5w3h> getPlanos5w3h() {
        return planos5w3h;
    }

    public void setPlanos5w3h(List<SubmissaoPlano5w3h> planos5w3h) {
        this.planos5w3h = planos5w3h;
    }

    public SubmissaoPdca getPdca() {
        return pdca;
    }

    public void setPdca(SubmissaoPdca pdca) {
        this.pdca = pdca;
        if (pdca != null) {
            pdca.setSubmissao(this);
        }
    }
}
