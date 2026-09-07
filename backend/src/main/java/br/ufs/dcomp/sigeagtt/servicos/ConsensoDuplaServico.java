package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.*;
import br.ufs.dcomp.sigeagtt.repositorios.*;
import br.ufs.dcomp.sigeagtt.transferencia.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class ConsensoDuplaServico {

    private final ConsensoDuplaRepositorio consensoRepositorio;
    private final ItemConsensoRepositorio itemConsensoRepositorio;
    private final ValidacaoDocenteRepositorio validacaoRepositorio;
    private final DuplaRevisoresRepositorio duplaRepositorio;
    private final ProntuarioSimuladoRepositorio prontuarioRepositorio;
    private final RevisaoIndividualRepositorio revisaoRepositorio;
    private final AchadoGatilhoRepositorio achadoRepositorio;
    private final GatilhoGttRepositorio gatilhoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;

    public ConsensoDuplaServico(ConsensoDuplaRepositorio consensoRepositorio,
                               ItemConsensoRepositorio itemConsensoRepositorio,
                               ValidacaoDocenteRepositorio validacaoRepositorio,
                               DuplaRevisoresRepositorio duplaRepositorio,
                               ProntuarioSimuladoRepositorio prontuarioRepositorio,
                               RevisaoIndividualRepositorio revisaoRepositorio,
                               AchadoGatilhoRepositorio achadoRepositorio,
                               GatilhoGttRepositorio gatilhoRepositorio,
                               UsuarioRepositorio usuarioRepositorio) {
        this.consensoRepositorio = consensoRepositorio;
        this.itemConsensoRepositorio = itemConsensoRepositorio;
        this.validacaoRepositorio = validacaoRepositorio;
        this.duplaRepositorio = duplaRepositorio;
        this.prontuarioRepositorio = prontuarioRepositorio;
        this.revisaoRepositorio = revisaoRepositorio;
        this.achadoRepositorio = achadoRepositorio;
        this.gatilhoRepositorio = gatilhoRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
    }

    @Transactional
    public ConsensoDuplaRespostaDTO obterOuCriarConsenso(Long duplaId, Long prontuarioId) {
        DuplaRevisores dupla = duplaRepositorio.findById(duplaId)
                .orElseThrow(() -> new NoSuchElementException("Dupla não encontrada: " + duplaId));

        ProntuarioSimulado prontuario = prontuarioRepositorio.findById(prontuarioId)
                .orElseThrow(() -> new NoSuchElementException("Prontuário não encontrado: " + prontuarioId));

        ConsensoDupla consenso = consensoRepositorio.findByDuplaIdAndProntuarioId(duplaId, prontuarioId)
                .orElseGet(() -> {
                    ConsensoDupla novo = new ConsensoDupla();
                    novo.setDupla(dupla);
                    novo.setProntuario(prontuario);
                    novo.setDataConsenso(LocalDateTime.now());
                    novo.setSubmetido(false);
                    return consensoRepositorio.save(novo);
                });

        return montarDTOCompleto(consenso);
    }

    @Transactional
    public ConsensoDuplaRespostaDTO salvarConsenso(Long consensoId, SubmeterConsensoDTO dto) {
        ConsensoDupla consenso = consensoRepositorio.findById(consensoId)
                .orElseThrow(() -> new NoSuchElementException("Consenso não encontrado: " + consensoId));

        if (Boolean.TRUE.equals(consenso.getSubmetido())) {
            throw new IllegalStateException("Este consenso já foi submetido e homologado ou está aguardando validação docente.");
        }

        DuplaRevisores dupla = consenso.getDupla();
        Long pId = consenso.getProntuario().getId();

        Optional<RevisaoIndividual> rev1 = revisaoRepositorio.findByDuplaIdAndAlunoIdAndProntuarioId(dupla.getId(), dupla.getAlunoRevisor1().getId(), pId);
        Optional<RevisaoIndividual> rev2 = revisaoRepositorio.findByDuplaIdAndAlunoIdAndProntuarioId(dupla.getId(), dupla.getAlunoRevisor2().getId(), pId);

        boolean rev1Finalizada = rev1.isPresent() && Boolean.TRUE.equals(rev1.get().getFinalizada());
        boolean rev2Finalizada = rev2.isPresent() && Boolean.TRUE.equals(rev2.get().getFinalizada());

        if (Boolean.TRUE.equals(dto.submeterFinal()) && (!rev1Finalizada || !rev2Finalizada)) {
            throw new IllegalStateException("A submissão do consenso exige que ambos os revisores da dupla tenham finalizado a auditoria individual.");
        }

        itemConsensoRepositorio.deleteByConsensoDuplaId(consenso.getId());

        if (dto.itens() != null && !dto.itens().isEmpty()) {
            for (ItemConsensoDTO item : dto.itens()) {
                GatilhoGtt gatilho = gatilhoRepositorio.findById(item.gatilhoId())
                        .orElseThrow(() -> new NoSuchElementException("Gatilho não encontrado: " + item.gatilhoId()));

                ItemConsenso ic = new ItemConsenso();
                ic.setConsensoDupla(consenso);
                ic.setGatilho(gatilho);
                ic.setConfirmouDano(Boolean.TRUE.equals(item.confirmouDano()));
                ic.setJustificativaDano(item.justificativaDano());
                ic.setDanoPresenteAdmissao(Boolean.TRUE.equals(item.danoPresenteAdmissao()));
                ic.setGravidadeConsenso(item.gravidadeConsenso());
                ic.setGravidadeHomologada(item.gravidadeHomologada() != null ? item.gravidadeHomologada() : item.gravidadeConsenso());

                itemConsensoRepositorio.save(ic);
            }
        }

        if (Boolean.TRUE.equals(dto.submeterFinal())) {
            consenso.setSubmetido(true);
            consenso.setDataConsenso(LocalDateTime.now());
        }

        return montarDTOCompleto(consensoRepositorio.save(consenso));
    }

    @Transactional
    public ConsensoDuplaRespostaDTO validarEHomologar(Long consensoId, HomologarConsensoDTO dto) {
        ConsensoDupla consenso = consensoRepositorio.findById(consensoId)
                .orElseThrow(() -> new NoSuchElementException("Consenso não encontrado: " + consensoId));

        Usuario professor = usuarioRepositorio.findById(dto.professorValidadorId())
                .orElseThrow(() -> new NoSuchElementException("Professor não encontrado: " + dto.professorValidadorId()));

        if (professor.getPerfil() != PerfilUsuario.PROFESSOR && professor.getPerfil() != PerfilUsuario.ADMINISTRADOR) {
            throw new IllegalArgumentException("Apenas docentes ou administradores podem validar e homologar o consenso.");
        }

        if (dto.reclassificacoesGravidade() != null && !dto.reclassificacoesGravidade().isEmpty()) {
            List<ItemConsenso> itens = itemConsensoRepositorio.findByConsensoDuplaId(consenso.getId());
            for (ItemConsenso item : itens) {
                if (dto.reclassificacoesGravidade().containsKey(item.getId())) {
                    item.setGravidadeHomologada(dto.reclassificacoesGravidade().get(item.getId()));
                    itemConsensoRepositorio.save(item);
                }
            }
        }

        ValidacaoDocente validacao = validacaoRepositorio.findByConsensoDuplaId(consenso.getId())
                .orElseGet(() -> {
                    ValidacaoDocente v = new ValidacaoDocente();
                    v.setConsensoDupla(consenso);
                    return v;
                });

        validacao.setProfessorValidador(professor);
        validacao.setParecerFormativo(dto.parecerFormativo());
        validacao.setHomologado(dto.homologado());
        validacao.setDataValidacao(LocalDateTime.now());
        validacaoRepositorio.save(validacao);

        return montarDTOCompleto(consenso);
    }

    private ConsensoDuplaRespostaDTO montarDTOCompleto(ConsensoDupla c) {
        List<ItemConsenso> itens = itemConsensoRepositorio.findByConsensoDuplaId(c.getId());
        List<ItemConsensoDTO> itensDTO = itens.stream().map(i -> new ItemConsensoDTO(
            i.getId(),
            i.getGatilho().getId(),
            i.getGatilho().getCodigo(),
            i.getGatilho().getDescricao(),
            i.getGatilho().getModulo().getNome(),
            i.getConfirmouDano(),
            i.getJustificativaDano(),
            i.getDanoPresenteAdmissao(),
            i.getGravidadeConsenso(),
            i.getGravidadeHomologada()
        )).toList();

        ValidacaoDocenteDTO validacaoDTO = validacaoRepositorio.findByConsensoDuplaId(c.getId())
                .map(v -> new ValidacaoDocenteDTO(
                    v.getId(),
                    v.getProfessorValidador().getId(),
                    v.getProfessorValidador().getNomeCompleto(),
                    v.getParecerFormativo(),
                    v.getHomologado(),
                    v.getDataValidacao()
                )).orElse(null);

        DuplaRevisores d = c.getDupla();
        Long pId = c.getProntuario().getId();

        Optional<RevisaoIndividual> rev1 = revisaoRepositorio.findByDuplaIdAndAlunoIdAndProntuarioId(d.getId(), d.getAlunoRevisor1().getId(), pId);
        Optional<RevisaoIndividual> rev2 = revisaoRepositorio.findByDuplaIdAndAlunoIdAndProntuarioId(d.getId(), d.getAlunoRevisor2().getId(), pId);

        List<AchadoGatilhoDTO> achados1 = List.of();
        boolean rev1Fin = false;
        int rev1Tempo = 0;
        if (rev1.isPresent()) {
            RevisaoIndividual r1 = rev1.get();
            rev1Fin = Boolean.TRUE.equals(r1.getFinalizada());
            rev1Tempo = r1.getTempoGastoSegundos() != null ? r1.getTempoGastoSegundos() : 0;
            achados1 = achadoRepositorio.findByRevisaoIndividualId(r1.getId()).stream().map(a -> new AchadoGatilhoDTO(
                a.getId(), a.getGatilho().getId(), a.getGatilho().getCodigo(), a.getGatilho().getDescricao(),
                a.getGatilho().getModulo().getNome(), a.getConfirmouDano(), a.getJustificativaDano(),
                a.getDanoPresenteAdmissao(), a.getGravidade()
            )).toList();
        }

        List<AchadoGatilhoDTO> achados2 = List.of();
        boolean rev2Fin = false;
        int rev2Tempo = 0;
        if (rev2.isPresent()) {
            RevisaoIndividual r2 = rev2.get();
            rev2Fin = Boolean.TRUE.equals(r2.getFinalizada());
            rev2Tempo = r2.getTempoGastoSegundos() != null ? r2.getTempoGastoSegundos() : 0;
            achados2 = achadoRepositorio.findByRevisaoIndividualId(r2.getId()).stream().map(a -> new AchadoGatilhoDTO(
                a.getId(), a.getGatilho().getId(), a.getGatilho().getCodigo(), a.getGatilho().getDescricao(),
                a.getGatilho().getModulo().getNome(), a.getConfirmouDano(), a.getJustificativaDano(),
                a.getDanoPresenteAdmissao(), a.getGravidade()
            )).toList();
        }

        ComparativoRevisaoDTO comparativo = new ComparativoRevisaoDTO(
            d.getAlunoRevisor1().getId(),
            d.getAlunoRevisor1().getNomeCompleto(),
            rev1Fin,
            rev1Tempo,
            achados1,
            d.getAlunoRevisor2().getId(),
            d.getAlunoRevisor2().getNomeCompleto(),
            rev2Fin,
            rev2Tempo,
            achados2
        );

        return ConsensoDuplaRespostaDTO.deEntidade(c, itensDTO, validacaoDTO, comparativo);
    }
}
