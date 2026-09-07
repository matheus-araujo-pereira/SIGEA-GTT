package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.CenarioClinico;
import br.ufs.dcomp.sigeagtt.modelos.ProntuarioSimulado;
import br.ufs.dcomp.sigeagtt.modelos.UnidadeHospitalar;
import br.ufs.dcomp.sigeagtt.repositorios.CenarioClinicoRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.ProntuarioSimuladoRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.UnidadeHospitalarRepositorio;
import br.ufs.dcomp.sigeagtt.transferencia.ProntuarioSimuladoRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.ProntuarioSimuladoRespostaDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ProntuarioSimuladoServico {

    private final ProntuarioSimuladoRepositorio repositorio;
    private final CenarioClinicoRepositorio cenarioRepositorio;
    private final UnidadeHospitalarRepositorio unidadeRepositorio;

    public ProntuarioSimuladoServico(ProntuarioSimuladoRepositorio repositorio,
                                     CenarioClinicoRepositorio cenarioRepositorio,
                                     UnidadeHospitalarRepositorio unidadeRepositorio) {
        this.repositorio = repositorio;
        this.cenarioRepositorio = cenarioRepositorio;
        this.unidadeRepositorio = unidadeRepositorio;
    }

    @Transactional(readOnly = true)
    public List<ProntuarioSimuladoRespostaDTO> listar(Long cenarioId) {
        List<ProntuarioSimulado> lista = (cenarioId != null)
                ? repositorio.findByCenarioId(cenarioId)
                : repositorio.findAll();

        return lista.stream().map(ProntuarioSimuladoRespostaDTO::deEntidade).toList();
    }

    @Transactional(readOnly = true)
    public ProntuarioSimuladoRespostaDTO buscarPorId(Long id) {
        ProntuarioSimulado p = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prontuário simulado não encontrado: " + id));
        return ProntuarioSimuladoRespostaDTO.deEntidade(p);
    }

    @Transactional
    public ProntuarioSimuladoRespostaDTO cadastrar(ProntuarioSimuladoRequisicaoDTO dto) {
        CenarioClinico cenario = cenarioRepositorio.findById(dto.cenarioId())
                .orElseThrow(() -> new IllegalArgumentException("Cenário clínico não encontrado: " + dto.cenarioId()));

        UnidadeHospitalar unidade = unidadeRepositorio.findById(dto.unidadeHospitalarId())
                .orElseThrow(() -> new IllegalArgumentException("Unidade hospitalar não encontrada: " + dto.unidadeHospitalarId()));

        validarDatas(dto.dataAdmissao(), dto.dataAlta());
        int permanencia = calcularTempoPermanencia(dto.dataAdmissao(), dto.dataAlta(), dto.tempoPermanenciaDias());
        String numAtend = dto.numeroAtendimento() != null ? dto.numeroAtendimento().trim().toUpperCase() : "";

        ProntuarioSimulado p = new ProntuarioSimulado();
        p.setCenario(cenario);
        p.setUnidadeHospitalar(unidade);
        p.setNumeroAtendimento(numAtend);
        p.setIdadePaciente(dto.idadePaciente());
        p.setDataAdmissao(dto.dataAdmissao());
        p.setDataAlta(dto.dataAlta());
        p.setTempoPermanenciaDias(permanencia);
        p.setSumarioAlta(dto.sumarioAlta());
        p.setPrescricoesMedicas(dto.prescricoesMedicas());
        p.setExamesLaboratoriais(dto.examesLaboratoriais());
        p.setRelatorioCirurgico(dto.relatorioCirurgico());
        p.setEvolucoesMultiprofissionais(dto.evolucoesMultiprofissionais());

        return ProntuarioSimuladoRespostaDTO.deEntidade(repositorio.save(p));
    }

    @Transactional
    public ProntuarioSimuladoRespostaDTO editar(Long id, ProntuarioSimuladoRequisicaoDTO dto) {
        ProntuarioSimulado p = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prontuário simulado não encontrado: " + id));

        CenarioClinico cenario = cenarioRepositorio.findById(dto.cenarioId())
                .orElseThrow(() -> new IllegalArgumentException("Cenário clínico não encontrado: " + dto.cenarioId()));

        UnidadeHospitalar unidade = unidadeRepositorio.findById(dto.unidadeHospitalarId())
                .orElseThrow(() -> new IllegalArgumentException("Unidade hospitalar não encontrada: " + dto.unidadeHospitalarId()));

        validarDatas(dto.dataAdmissao(), dto.dataAlta());
        int permanencia = calcularTempoPermanencia(dto.dataAdmissao(), dto.dataAlta(), dto.tempoPermanenciaDias());
        String numAtend = dto.numeroAtendimento() != null ? dto.numeroAtendimento().trim().toUpperCase() : "";

        p.setCenario(cenario);
        p.setUnidadeHospitalar(unidade);
        p.setNumeroAtendimento(numAtend);
        p.setIdadePaciente(dto.idadePaciente());
        p.setDataAdmissao(dto.dataAdmissao());
        p.setDataAlta(dto.dataAlta());
        p.setTempoPermanenciaDias(permanencia);
        p.setSumarioAlta(dto.sumarioAlta());
        p.setPrescricoesMedicas(dto.prescricoesMedicas());
        p.setExamesLaboratoriais(dto.examesLaboratoriais());
        p.setRelatorioCirurgico(dto.relatorioCirurgico());
        p.setEvolucoesMultiprofissionais(dto.evolucoesMultiprofissionais());

        return ProntuarioSimuladoRespostaDTO.deEntidade(repositorio.save(p));
    }

    @Transactional
    public void excluir(Long id) {
        ProntuarioSimulado p = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prontuário simulado não encontrado: " + id));
        repositorio.delete(p);
    }

    private void validarDatas(LocalDate admissao, LocalDate alta) {
        if (alta != null && admissao != null && alta.isBefore(admissao)) {
            throw new IllegalArgumentException("A data de alta não pode ser anterior à data de admissão.");
        }
    }

    private int calcularTempoPermanencia(LocalDate admissao, LocalDate alta, Integer tempoInformado) {
        if (tempoInformado != null && tempoInformado > 0) {
            return tempoInformado;
        }
        if (admissao != null && alta != null) {
            long dias = ChronoUnit.DAYS.between(admissao, alta);
            return (int) Math.max(1, dias);
        }
        return 1;
    }
}
