package br.ufs.dcomp.sigeagtt.modulos.cenario.modelo;

import br.ufs.dcomp.sigeagtt.modulos.unidade.modelo.UnidadeHospitalar;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "prontuarios_simulados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class ProntuarioSimulado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cenario_id", nullable = false)
    private CenarioClinico cenario;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unidade_hospitalar_id", nullable = false)
    private UnidadeHospitalar unidadeHospitalar;

    @NotBlank
    @Size(max = 50)
    @Column(name = "numero_atendimento", nullable = false, length = 50)
    private String numeroAtendimento;

    @NotNull
    @Column(name = "idade_paciente", nullable = false)
    private Integer idadePaciente;

    @NotNull
    @Column(name = "data_admissao", nullable = false)
    private LocalDate dataAdmissao;

    @NotNull
    @Column(name = "data_alta", nullable = false)
    private LocalDate dataAlta;

    @NotNull
    @Column(name = "tempo_permanencia_dias", nullable = false)
    private Integer tempoPermanenciaDias;

    @NotBlank
    @Column(name = "sumario_alta", nullable = false, columnDefinition = "TEXT")
    private String sumarioAlta;

    @NotBlank
    @Column(name = "prescricoes_medicas", nullable = false, columnDefinition = "TEXT")
    private String prescricoesMedicas;

    @NotBlank
    @Column(name = "exames_laboratoriais", nullable = false, columnDefinition = "TEXT")
    private String examesLaboratoriais;

    @Column(name = "relatorio_cirurgico", columnDefinition = "TEXT")
    private String relatorioCirurgico;

    @NotBlank
    @Column(name = "evolucoes_multiprofissionais", nullable = false, columnDefinition = "TEXT")
    private String evolucoesMultiprofissionais;
}
