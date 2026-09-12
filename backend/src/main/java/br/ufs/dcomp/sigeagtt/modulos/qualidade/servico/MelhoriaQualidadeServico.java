package br.ufs.dcomp.sigeagtt.modulos.qualidade.servico;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.RevisaoIndividual;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.RevisaoIndividualRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.IshikawaDTO;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.MelhoriaQualidadeRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.PdcaDTO;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.Plano5w3hDTO;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.dto.SalvarMelhoriaQualidadeDTO;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.modelo.AnaliseIshikawa;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.modelo.CicloPdca;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.modelo.PlanoAcao5w3h;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.repositorio.AnaliseIshikawaRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.repositorio.CicloPdcaRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.qualidade.repositorio.PlanoAcao5w3hRepositorio;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class MelhoriaQualidadeServico {
    private final AnaliseIshikawaRepositorio ishikawaRepositorio;
    private final PlanoAcao5w3hRepositorio planoRepositorio;
    private final CicloPdcaRepositorio pdcaRepositorio;
    private final RevisaoIndividualRepositorio revisaoRepositorio;

    public MelhoriaQualidadeServico(AnaliseIshikawaRepositorio ishikawaRepositorio,
            PlanoAcao5w3hRepositorio planoRepositorio,
            CicloPdcaRepositorio pdcaRepositorio,
            RevisaoIndividualRepositorio revisaoRepositorio) {
        this.ishikawaRepositorio = ishikawaRepositorio;
        this.planoRepositorio = planoRepositorio;
        this.pdcaRepositorio = pdcaRepositorio;
        this.revisaoRepositorio = revisaoRepositorio;
    }

    @Transactional(readOnly = true)
    public MelhoriaQualidadeRespostaDTO buscar(Long revisaoId) {
        obterRevisao(revisaoId);
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
        return new MelhoriaQualidadeRespostaDTO(revisaoId, ishikawa, planos, pdca);
    }

    @Transactional
    public MelhoriaQualidadeRespostaDTO salvar(Long revisaoId, SalvarMelhoriaQualidadeDTO dto) {
        RevisaoIndividual revisao = obterRevisao(revisaoId);
        if (dto.ishikawa() != null) {
            AnaliseIshikawa ishikawa = ishikawaRepositorio.findByRevisaoIndividualId(revisaoId)
                    .orElseGet(AnaliseIshikawa::new);
            ishikawa.setRevisaoIndividual(revisao);
            ishikawa.setEfeitoPrincipal(dto.ishikawa().efeitoPrincipal());
            ishikawa.setMetodo(dto.ishikawa().metodo());
            ishikawa.setMaoDeObra(dto.ishikawa().maoDeObra());
            ishikawa.setMaterial(dto.ishikawa().material());
            ishikawa.setMedida(dto.ishikawa().medida());
            ishikawa.setMeioAmbiente(dto.ishikawa().meioAmbiente());
            ishikawa.setMaquina(dto.ishikawa().maquina());
            ishikawaRepositorio.save(ishikawa);
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
            CicloPdca pdca = pdcaRepositorio.findByRevisaoIndividualId(revisaoId)
                    .orElseGet(CicloPdca::new);
            pdca.setRevisaoIndividual(revisao);
            pdca.setPlanejar(dto.pdca().planejar());
            pdca.setFazer(dto.pdca().fazer());
            pdca.setChecar(dto.pdca().checar());
            pdca.setAgir(dto.pdca().agir());
            pdcaRepositorio.save(pdca);
        }
        return buscar(revisaoId);
    }

    private RevisaoIndividual obterRevisao(Long revisaoId) {
        return revisaoRepositorio.findById(revisaoId)
                .orElseThrow(() -> new NoSuchElementException("Revisão individual não encontrada: " + revisaoId));
    }
}
