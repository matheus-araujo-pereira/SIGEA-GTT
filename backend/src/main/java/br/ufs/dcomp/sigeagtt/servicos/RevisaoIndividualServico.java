package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.*;
import br.ufs.dcomp.sigeagtt.repositorios.*;
import br.ufs.dcomp.sigeagtt.transferencia.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class RevisaoIndividualServico {

    private final RevisaoIndividualRepositorio revisaoRepositorio;
    private final AchadoGatilhoRepositorio achadoRepositorio;
    private final DuplaRevisoresRepositorio duplaRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final ProntuarioSimuladoRepositorio prontuarioRepositorio;
    private final GatilhoGttRepositorio gatilhoRepositorio;

    public RevisaoIndividualServico(RevisaoIndividualRepositorio revisaoRepositorio,
                                   AchadoGatilhoRepositorio achadoRepositorio,
                                   DuplaRevisoresRepositorio duplaRepositorio,
                                   UsuarioRepositorio usuarioRepositorio,
                                   ProntuarioSimuladoRepositorio prontuarioRepositorio,
                                   GatilhoGttRepositorio gatilhoRepositorio) {
        this.revisaoRepositorio = revisaoRepositorio;
        this.achadoRepositorio = achadoRepositorio;
        this.duplaRepositorio = duplaRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.prontuarioRepositorio = prontuarioRepositorio;
        this.gatilhoRepositorio = gatilhoRepositorio;
    }

    @Transactional(readOnly = true)
    public List<AtividadeDiscenteDTO> listarAtividadesDoAluno(Long alunoId) {
        List<DuplaRevisores> todasDuplas = duplaRepositorio.findAll();
        List<DuplaRevisores> duplasDoAluno = todasDuplas.stream()
                .filter(d -> Boolean.TRUE.equals(d.getAtiva()) &&
                        (d.getAlunoRevisor1().getId().equals(alunoId) || d.getAlunoRevisor2().getId().equals(alunoId)))
                .toList();

        List<AtividadeDiscenteDTO> resultado = new ArrayList<>();

        for (DuplaRevisores d : duplasDoAluno) {
            AtividadeAuditoria at = d.getAtividade();
            Usuario parceiro = d.getAlunoRevisor1().getId().equals(alunoId) ? d.getAlunoRevisor2() : d.getAlunoRevisor1();

            List<ProntuarioSimulado> prontuarios = prontuarioRepositorio.findByCenarioId(at.getCenario().getId());
            List<ProntuarioItemAuditoriaDTO> itensProntuarios = new ArrayList<>();

            for (ProntuarioSimulado p : prontuarios) {
                Optional<RevisaoIndividual> revisaoOpt = revisaoRepositorio.findByDuplaIdAndAlunoIdAndProntuarioId(d.getId(), alunoId, p.getId());
                
                Long revId = null;
                Boolean fin = false;
                Integer tempo = 0;
                int totalGat = 0;
                int totalDanos = 0;

                if (revisaoOpt.isPresent()) {
                    RevisaoIndividual rev = revisaoOpt.get();
                    revId = rev.getId();
                    fin = Boolean.TRUE.equals(rev.getFinalizada());
                    tempo = rev.getTempoGastoSegundos() != null ? rev.getTempoGastoSegundos() : 0;

                    List<AchadoGatilho> achados = achadoRepositorio.findByRevisaoIndividualId(revId);
                    totalGat = achados.size();
                    totalDanos = (int) achados.stream().filter(a -> Boolean.TRUE.equals(a.getConfirmouDano())).count();
                }

                itensProntuarios.add(new ProntuarioItemAuditoriaDTO(
                    p.getId(),
                    p.getNumeroAtendimento(),
                    p.getUnidadeHospitalar().getSigla(),
                    p.getIdadePaciente(),
                    p.getTempoPermanenciaDias(),
                    revId,
                    fin,
                    tempo,
                    totalGat,
                    totalDanos
                ));
            }

            resultado.add(new AtividadeDiscenteDTO(
                at.getId(),
                at.getTitulo(),
                at.getTurma().getId(),
                at.getTurma().getCodigoDisciplina(),
                at.getCenario().getId(),
                at.getCenario().getTitulo(),
                d.getId(),
                parceiro.getNomeCompleto(),
                parceiro.getMatriculaSigaa(),
                at.getDataInicio(),
                at.getDataFim(),
                at.getTempoLimiteMinutos(),
                at.getFinalizada(),
                itensProntuarios
            ));
        }

        return resultado;
    }

    @Transactional
    public RevisaoIndividualRespostaDTO obterOuIniciarRevisao(IniciarRevisaoRequisicaoDTO dto) {
        RevisaoIndividual revisao = revisaoRepositorio
                .findByDuplaIdAndAlunoIdAndProntuarioId(dto.duplaId(), dto.alunoId(), dto.prontuarioId())
                .orElseGet(() -> {
                    DuplaRevisores dupla = duplaRepositorio.findById(dto.duplaId())
                            .orElseThrow(() -> new NoSuchElementException("Dupla não encontrada: " + dto.duplaId()));
                    Usuario aluno = usuarioRepositorio.findById(dto.alunoId())
                            .orElseThrow(() -> new NoSuchElementException("Aluno não encontrado: " + dto.alunoId()));
                    ProntuarioSimulado prontuario = prontuarioRepositorio.findById(dto.prontuarioId())
                            .orElseThrow(() -> new NoSuchElementException("Prontuário não encontrado: " + dto.prontuarioId()));

                    RevisaoIndividual nova = new RevisaoIndividual();
                    nova.setDupla(dupla);
                    nova.setAluno(aluno);
                    nova.setProntuario(prontuario);
                    nova.setTempoGastoSegundos(0);
                    nova.setFinalizada(false);
                    return revisaoRepositorio.save(nova);
                });

        return converterParaDTO(revisao);
    }

    @Transactional
    public RevisaoIndividualRespostaDTO salvarAchadosETempo(Long id, SalvarRevisaoRequisicaoDTO dto) {
        RevisaoIndividual revisao = revisaoRepositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Revisão individual não encontrada: " + id));

        if (Boolean.TRUE.equals(revisao.getFinalizada())) {
            throw new IllegalStateException("Esta auditoria individual já foi finalizada e não pode mais ser alterada.");
        }

        revisao.setTempoGastoSegundos(dto.tempoGastoSegundos());

        if (Boolean.TRUE.equals(dto.finalizar())) {
            revisao.setFinalizada(true);
            revisao.setDataSubmissao(LocalDateTime.now());
        }

        achadoRepositorio.deleteByRevisaoIndividualId(revisao.getId());

        if (dto.achados() != null && !dto.achados().isEmpty()) {
            for (AchadoGatilhoDTO item : dto.achados()) {
                GatilhoGtt gatilho = gatilhoRepositorio.findById(item.gatilhoId())
                        .orElseThrow(() -> new NoSuchElementException("Gatilho não encontrado: " + item.gatilhoId()));

                AchadoGatilho a = new AchadoGatilho();
                a.setRevisaoIndividual(revisao);
                a.setGatilho(gatilho);
                a.setConfirmouDano(Boolean.TRUE.equals(item.confirmouDano()));
                a.setJustificativaDano(item.justificativaDano());
                a.setDanoPresenteAdmissao(Boolean.TRUE.equals(item.danoPresenteAdmissao()));
                a.setGravidade(Boolean.TRUE.equals(item.confirmouDano()) ? item.gravidade() : null);

                achadoRepositorio.save(a);
            }
        }

        RevisaoIndividual atualizada = revisaoRepositorio.save(revisao);
        return converterParaDTO(atualizada);
    }

    private RevisaoIndividualRespostaDTO converterParaDTO(RevisaoIndividual r) {
        List<AchadoGatilho> achadosEntidade = achadoRepositorio.findByRevisaoIndividualId(r.getId());
        List<AchadoGatilhoDTO> achadosDTO = achadosEntidade.stream().map(a -> new AchadoGatilhoDTO(
            a.getId(),
            a.getGatilho().getId(),
            a.getGatilho().getCodigo(),
            a.getGatilho().getDescricao(),
            a.getGatilho().getModulo().getNome(),
            a.getConfirmouDano(),
            a.getJustificativaDano(),
            a.getDanoPresenteAdmissao(),
            a.getGravidade()
        )).toList();

        return RevisaoIndividualRespostaDTO.deEntidade(r, achadosDTO);
    }
}
