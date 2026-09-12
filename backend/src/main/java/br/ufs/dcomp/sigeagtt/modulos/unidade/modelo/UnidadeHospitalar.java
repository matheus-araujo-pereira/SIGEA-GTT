package br.ufs.dcomp.sigeagtt.modulos.unidade.modelo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "unidades_hospitalares")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class UnidadeHospitalar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @NotBlank
    @Size(max = 20)
    @Column(name = "sigla", nullable = false, length = 20)
    private String sigla;

    @NotNull
    @Column(name = "ativa", nullable = false)
    private Boolean ativa = true;
}
