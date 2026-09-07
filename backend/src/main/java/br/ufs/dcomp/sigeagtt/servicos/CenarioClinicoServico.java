package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.CenarioClinico;
import br.ufs.dcomp.sigeagtt.modelos.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modelos.Usuario;
import br.ufs.dcomp.sigeagtt.repositorios.CenarioClinicoRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.UsuarioRepositorio;
import br.ufs.dcomp.sigeagtt.transferencia.CenarioClinicoRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.CenarioClinicoRespostaDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CenarioClinicoServico {

    private final CenarioClinicoRepositorio cenarioRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;

    public CenarioClinicoServico(CenarioClinicoRepositorio cenarioRepositorio, UsuarioRepositorio usuarioRepositorio) {
        this.cenarioRepositorio = cenarioRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
    }

    @Transactional(readOnly = true)
    public List<CenarioClinicoRespostaDTO> listar(Long professorId) {
        List<CenarioClinico> lista = (professorId != null)
                ? cenarioRepositorio.findByProfessorCriadorId(professorId)
                : cenarioRepositorio.findAll();

        return lista.stream().map(CenarioClinicoRespostaDTO::deEntidade).toList();
    }

    @Transactional(readOnly = true)
    public CenarioClinicoRespostaDTO buscarPorId(Long id) {
        CenarioClinico cenario = cenarioRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cenário clínico não encontrado: " + id));
        return CenarioClinicoRespostaDTO.deEntidade(cenario);
    }

    @Transactional
    public CenarioClinicoRespostaDTO cadastrar(CenarioClinicoRequisicaoDTO dto) {
        Usuario professor = usuarioRepositorio.findById(dto.professorCriadorId())
                .orElseThrow(() -> new IllegalArgumentException("Professor responsável não encontrado: " + dto.professorCriadorId()));

        if (professor.getPerfil() != PerfilUsuario.PROFESSOR && professor.getPerfil() != PerfilUsuario.ADMINISTRADOR) {
            throw new IllegalArgumentException("Apenas docentes ou administradores podem cadastrar cenários clínicos.");
        }

        CenarioClinico cenario = new CenarioClinico();
        cenario.setTitulo(dto.titulo());
        cenario.setDescricaoPedagogica(dto.descricaoPedagogica());
        cenario.setObjetivosAprendizagem(dto.objetivosAprendizagem());
        cenario.setProfessorCriador(professor);

        return CenarioClinicoRespostaDTO.deEntidade(cenarioRepositorio.save(cenario));
    }

    @Transactional
    public CenarioClinicoRespostaDTO editar(Long id, CenarioClinicoRequisicaoDTO dto) {
        CenarioClinico cenario = cenarioRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cenário clínico não encontrado: " + id));

        Usuario professor = usuarioRepositorio.findById(dto.professorCriadorId())
                .orElseThrow(() -> new IllegalArgumentException("Professor não encontrado: " + dto.professorCriadorId()));

        cenario.setTitulo(dto.titulo());
        cenario.setDescricaoPedagogica(dto.descricaoPedagogica());
        cenario.setObjetivosAprendizagem(dto.objetivosAprendizagem());
        cenario.setProfessorCriador(professor);

        return CenarioClinicoRespostaDTO.deEntidade(cenarioRepositorio.save(cenario));
    }

    @Transactional
    public void excluir(Long id) {
        CenarioClinico cenario = cenarioRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cenário clínico não encontrado: " + id));
        cenarioRepositorio.delete(cenario);
    }
}
