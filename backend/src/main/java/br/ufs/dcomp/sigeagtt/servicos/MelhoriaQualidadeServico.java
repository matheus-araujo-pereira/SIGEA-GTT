package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.*;
import br.ufs.dcomp.sigeagtt.repositorios.*;
import br.ufs.dcomp.sigeagtt.transferencia.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class MelhoriaQualidadeServico {

    private final ConsensoDuplaRepositorio consensoRepositorio;
    private final AnaliseIshikawaRepositorio ishikawaRepositorio;
    private final PlanoAcao5w3hRepositorio planoRepositorio;
    private final CicloPdcaRepositorio pdcaRepositorio;
    private final RevisaoIndividualRepositorio revisaoRepositorio;

    public MelhoriaQualidadeServico(ConsensoDuplaRepositorio consensoRepositorio,
            AnaliseIshikawaRepositorio ishikawaRepositorio,
            PlanoAcao5w3hRepositorio planoRepositorio,
            CicloPdcaRepositorio pdcaRepositorio,
            RevisaoIndividualRepositorio revisaoRepositorio) {
        this.consensoRepositorio = consensoRepositorio;
        this.ishikawaRepositorio = ishikawaRepositorio;
        this.planoRepositorio = planoRepositorio;
        this.pdcaRepositorio = pdcaRepositorio;
        this.revisaoRepositorio = revisaoRepositorio;
    }

    @Transactional(readOnly = true)
    public MelhoriaQualidadeRespostaDTO buscarPorRevisao(Long revisaoId) {
        RevisaoIndividual revisao = revisaoRepositorio.findById(revisaoId)
                .orElseThrow(() -> new NoSuchElementException("Revisão individual não encontrada: " + revisaoId));
        IshikawaDTO ishikawa = ishikawaRepositorio.findByRevisaoIndividualId(revisaoId)
                .map(i -> new IshikawaDTO(i.getId(), i.getEfeitoPrincipal(), i.getMetodo(), i.getMaoDeObra(),
                        i.getMaterial(), i.getMedida(), i.getMeioAmbiente(), i.getMaquina()))
                .orElse(null);
        List<Plano5w3hDTO> planos = planoRepositorio.findByRevisaoIndividualId(revisaoId).stream()
                .map(p -> new Plano5w3hDTO(p.getId(), p.getOQue(), p.getPorQue(), p.getQuem(), p.getOnde(),
                        p.getQuando(), p.getComo(), p.getQuantoCusta(), p.getComoMedir()))
                .toList();
        PdcaDTO pdca = pdcaRepositorio.findByRevisaoIndividualId(revisaoId)
                .map(p -> new PdcaDTO(p.getId(), p.getPlanejar(), p.getFazer(), p.getChecar(), p.getAgir()))
                .orElse(null);
        return new MelhoriaQualidadeRespostaDTO(revisao.getId(), ishikawa, planos, pdca);
    }

    @Transactional
    public MelhoriaQualidadeRespostaDTO salvarPorRevisao(Long revisaoId, SalvarMelhoriaQualidadeDTO dto) {
        RevisaoIndividual revisao = revisaoRepositorio.findById(revisaoId)
                .orElseThrow(() -> new NoSuchElementException("Revisão individual não encontrada: " + revisaoId));
        if (dto.ishikawa() != null) {
            AnaliseIshikawa ish = ishikawaRepositorio.findByRevisaoIndividualId(revisaoId)
                    .orElseGet(AnaliseIshikawa::new);
            ish.setRevisaoIndividual(revisao);
            ish.setEfeitoPrincipal(dto.ishikawa().efeitoPrincipal());
            ish.setMetodo(dto.ishikawa().metodo());
            ish.setMaoDeObra(dto.ishikawa().maoDeObra());
            ish.setMaterial(dto.ishikawa().material());
            ish.setMedida(dto.ishikawa().medida());
            ish.setMeioAmbiente(dto.ishikawa().meioAmbiente());
            ish.setMaquina(dto.ishikawa().maquina());
            ishikawaRepositorio.save(ish);
        }
        planoRepositorio.deleteByRevisaoIndividualId(revisaoId);
        if (dto.planos5w3h() != null) {
            for (Plano5w3hDTO item : dto.planos5w3h()) {
                PlanoAcao5w3h plano = new PlanoAcao5w3h();
                plano.setRevisaoIndividual(revisao);
                plano.setOQue(item.oQue());
                plano.setPorQue(item.porQue());
                plano.setQuem(item.quem());
                plano.setOnde(item.onde());
                plano.setQuando(item.quando());
                plano.setComo(item.como());
                plano.setQuantoCusta(item.quantoCusta());
                plano.setComoMedir(item.comoMedir());
                planoRepositorio.save(plano);
            }
        }
        if (dto.pdca() != null) {
            CicloPdca pdca = pdcaRepositorio.findByRevisaoIndividualId(revisaoId).orElseGet(CicloPdca::new);
            pdca.setRevisaoIndividual(revisao);
            pdca.setPlanejar(dto.pdca().planejar());
            pdca.setFazer(dto.pdca().fazer());
            pdca.setChecar(dto.pdca().checar());
            pdca.setAgir(dto.pdca().agir());
            pdcaRepositorio.save(pdca);
        }
        return buscarPorRevisao(revisaoId);
    }

    @Transactional(readOnly = true)
    public MelhoriaQualidadeRespostaDTO buscarPorConsenso(Long consensoDuplaId) {
        ConsensoDupla consenso = consensoRepositorio.findById(consensoDuplaId)
                .orElseThrow(() -> new NoSuchElementException("Consenso não encontrado: " + consensoDuplaId));

        IshikawaDTO ishikawaDTO = ishikawaRepositorio.findByConsensoDuplaId(consenso.getId())
                .map(i -> new IshikawaDTO(i.getId(), i.getEfeitoPrincipal(), i.getMetodo(), i.getMaoDeObra(),
                        i.getMaterial(), i.getMedida(), i.getMeioAmbiente(), i.getMaquina()))
                .orElse(null);

        List<Plano5w3hDTO> planosDTO = planoRepositorio.findByConsensoDuplaId(consenso.getId()).stream()
                .map(p -> new Plano5w3hDTO(p.getId(), p.getOQue(), p.getPorQue(), p.getQuem(), p.getOnde(),
                        p.getQuando(), p.getComo(), p.getQuantoCusta(), p.getComoMedir()))
                .toList();

        PdcaDTO pdcaDTO = pdcaRepositorio.findByConsensoDuplaId(consenso.getId())
                .map(pd -> new PdcaDTO(pd.getId(), pd.getPlanejar(), pd.getFazer(), pd.getChecar(), pd.getAgir()))
                .orElse(null);

        return new MelhoriaQualidadeRespostaDTO(consenso.getId(), ishikawaDTO, planosDTO, pdcaDTO);
    }

    @Transactional
    public MelhoriaQualidadeRespostaDTO salvar(Long consensoDuplaId, SalvarMelhoriaQualidadeDTO dto) {
        ConsensoDupla consenso = consensoRepositorio.findById(consensoDuplaId)
                .orElseThrow(() -> new NoSuchElementException("Consenso não encontrado: " + consensoDuplaId));

        // Ishikawa
        if (dto.ishikawa() != null) {
            AnaliseIshikawa ish = ishikawaRepositorio.findByConsensoDuplaId(consenso.getId())
                    .orElseGet(() -> {
                        AnaliseIshikawa i = new AnaliseIshikawa();
                        i.setConsensoDupla(consenso);
                        return i;
                    });
            ish.setEfeitoPrincipal(dto.ishikawa().efeitoPrincipal());
            ish.setMetodo(dto.ishikawa().metodo());
            ish.setMaoDeObra(dto.ishikawa().maoDeObra());
            ish.setMaterial(dto.ishikawa().material());
            ish.setMedida(dto.ishikawa().medida());
            ish.setMeioAmbiente(dto.ishikawa().meioAmbiente());
            ish.setMaquina(dto.ishikawa().maquina());
            ishikawaRepositorio.save(ish);
        }

        // 5W3H
        planoRepositorio.deleteByConsensoDuplaId(consenso.getId());
        if (dto.planos5w3h() != null && !dto.planos5w3h().isEmpty()) {
            for (Plano5w3hDTO p : dto.planos5w3h()) {
                PlanoAcao5w3h plano = new PlanoAcao5w3h();
                plano.setConsensoDupla(consenso);
                plano.setOQue(p.oQue());
                plano.setPorQue(p.porQue());
                plano.setQuem(p.quem());
                plano.setOnde(p.onde());
                plano.setQuando(p.quando());
                plano.setComo(p.como());
                plano.setQuantoCusta(p.quantoCusta());
                plano.setComoMedir(p.comoMedir());
                planoRepositorio.save(plano);
            }
        }

        // PDCA
        if (dto.pdca() != null) {
            CicloPdca pd = pdcaRepositorio.findByConsensoDuplaId(consenso.getId())
                    .orElseGet(() -> {
                        CicloPdca c = new CicloPdca();
                        c.setConsensoDupla(consenso);
                        return c;
                    });
            pd.setPlanejar(dto.pdca().planejar());
            pd.setFazer(dto.pdca().fazer());
            pd.setChecar(dto.pdca().checar());
            pd.setAgir(dto.pdca().agir());
            pdcaRepositorio.save(pd);
        }

        return buscarPorConsenso(consenso.getId());
    }
}
