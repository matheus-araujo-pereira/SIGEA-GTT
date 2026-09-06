package br.ufs.dcomp.sigeagtt.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    @Column(name = "nome_completo", nullable = false, length = 150)
    private String nomeCompleto;

    @NotBlank
    @Size(min = 11, max = 11)
    @Column(name = "cpf", nullable = false, unique = true, length = 11)
    private String cpf;

    @NotBlank
    @Email
    @Size(max = 150)
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank
    @Column(name = "senha", nullable = false)
    private String senha;

    @NotNull
    @Column(name = "primeiro_acesso", nullable = false)
    private Boolean primeiroAcesso = true;

    @NotBlank
    @Size(max = 100)
    @Column(name = "cargo", nullable = false, length = 100)
    private String cargo;

    @Size(min = 12, max = 12)
    @Column(name = "matricula_sigaa", unique = true, length = 12)
    private String matriculaSigaa;

    @NotNull
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "perfil", nullable = false, columnDefinition = "perfil_usuario_enum")
    private PerfilUsuario perfil;

    @NotNull
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void aoCriar() {
        if (this.criadoEm == null) this.criadoEm = LocalDateTime.now();
        if (this.ativo == null) this.ativo = true;
        if (this.primeiroAcesso == null) this.primeiroAcesso = true;
    }

    public Usuario() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomeCompleto() { return nomeCompleto; }
    public void setNomeCompleto(String nomeCompleto) { this.nomeCompleto = nomeCompleto; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public Boolean getPrimeiroAcesso() { return primeiroAcesso; }
    public void setPrimeiroAcesso(Boolean primeiroAcesso) { this.primeiroAcesso = primeiroAcesso; }

    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }

    public String getMatriculaSigaa() { return matriculaSigaa; }
    public void setMatriculaSigaa(String matriculaSigaa) { this.matriculaSigaa = matriculaSigaa; }

    public PerfilUsuario getPerfil() { return perfil; }
    public void setPerfil(PerfilUsuario perfil) { this.perfil = perfil; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
