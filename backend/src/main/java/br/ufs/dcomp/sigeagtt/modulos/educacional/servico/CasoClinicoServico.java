package br.ufs.dcomp.sigeagtt.modulos.educacional.servico;

import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.CasoClinicoDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.dto.SalvarCasoClinicoDTO;
import br.ufs.dcomp.sigeagtt.modulos.educacional.modelo.CasoClinico;
import br.ufs.dcomp.sigeagtt.modulos.educacional.repositorio.CasoClinicoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.unidade.modelo.UnidadeHospitalar;
import br.ufs.dcomp.sigeagtt.modulos.unidade.repositorio.UnidadeHospitalarRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CasoClinicoServico {

    private final CasoClinicoRepositorio casoRepositorio;
    private final UnidadeHospitalarRepositorio unidadeRepositorio;

    public CasoClinicoServico(CasoClinicoRepositorio casoRepositorio, UnidadeHospitalarRepositorio unidadeRepositorio) {
        this.casoRepositorio = casoRepositorio;
        this.unidadeRepositorio = unidadeRepositorio;
    }

    @Transactional(readOnly = true)
    public List<CasoClinicoDTO> listar(Usuario usuarioLogado) {
        List<CasoClinico> casos;
        if (usuarioLogado.getPerfil() == PerfilUsuario.ADMINISTRADOR) {
            casos = casoRepositorio.findAllByOrderByCriadoEmDesc();
        } else {
            casos = casoRepositorio.findByProfessorCriadorIdOrderByCriadoEmDesc(usuarioLogado.getId());
        }
        return casos.stream().map(CasoClinicoDTO::deEntidade).toList();
    }

    @Transactional(readOnly = true)
    public CasoClinicoDTO buscarPorId(Long id) {
        CasoClinico caso = casoRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Caso clínico não encontrado (ID: " + id + ")"));
        return CasoClinicoDTO.deEntidade(caso);
    }

    @Transactional
    public CasoClinicoDTO salvar(SalvarCasoClinicoDTO dto, Usuario professorLogado) {
        UnidadeHospitalar unidade = unidadeRepositorio.findById(dto.unidadeHospitalarId())
                .orElseThrow(() -> new IllegalArgumentException("Unidade hospitalar não encontrada"));

        CasoClinico c = new CasoClinico();
        c.setProfessorCriador(professorLogado);
        c.setUnidadeHospitalar(unidade);
        aplicarDados(c, dto);

        CasoClinico salvo = casoRepositorio.save(c);
        return CasoClinicoDTO.deEntidade(salvo);
    }

    @Transactional
    public CasoClinicoDTO atualizar(Long id, SalvarCasoClinicoDTO dto, Usuario usuarioLogado) {
        CasoClinico c = casoRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Caso clínico não encontrado (ID: " + id + ")"));

        if (usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR &&
                !c.getProfessorCriador().getId().equals(usuarioLogado.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para editar este caso clínico.");
        }

        UnidadeHospitalar unidade = unidadeRepositorio.findById(dto.unidadeHospitalarId())
                .orElseThrow(() -> new IllegalArgumentException("Unidade hospitalar não encontrada"));

        c.setUnidadeHospitalar(unidade);
        aplicarDados(c, dto);

        CasoClinico salvo = casoRepositorio.save(c);
        return CasoClinicoDTO.deEntidade(salvo);
    }

    @Transactional
    public void excluir(Long id, Usuario usuarioLogado) {
        CasoClinico c = casoRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Caso clínico não encontrado"));

        if (usuarioLogado.getPerfil() != PerfilUsuario.ADMINISTRADOR &&
                !c.getProfessorCriador().getId().equals(usuarioLogado.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para excluir este caso clínico.");
        }

        casoRepositorio.delete(c);
    }

    private void aplicarDados(CasoClinico c, SalvarCasoClinicoDTO dto) {
        c.setTitulo(dto.titulo());
        c.setDescricaoCaso(dto.descricaoCaso());
        c.setObjetivosAprendizagem(dto.objetivosAprendizagem());
        c.setNumeroAtendimento(dto.numeroAtendimento());
        c.setIdadePaciente(dto.idadePaciente());
        c.setDataAdmissao(dto.dataAdmissao());
        c.setDataAlta(dto.dataAlta());
        c.setTempoPermanenciaDias(dto.tempoPermanenciaDias());
        c.setSumarioAlta(dto.sumarioAlta());
        c.setPrescricoesMedicas(dto.prescricoesMedicas());
        c.setExamesLaboratoriais(dto.examesLaboratoriais());
        c.setRelatorioCirurgico(dto.relatorioCirurgico());
        c.setEvolucoesMultiprofissionais(dto.evolucoesMultiprofissionais());
    }
}
