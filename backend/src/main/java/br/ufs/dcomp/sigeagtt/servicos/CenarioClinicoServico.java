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
import java.util.NoSuchElementException;

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
        CenarioClinico c = cenarioRepositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Cenário clínico não encontrado: " + id));
        return CenarioClinicoRespostaDTO.deEntidade(c);
    }

    @Transactional
    public CenarioClinicoRespostaDTO cadastrar(CenarioClinicoRequisicaoDTO dto) {
        Usuario professor = usuarioRepositorio.findById(dto.professorCriadorId())
                .orElseThrow(() -> new NoSuchElementException("Professor criador não encontrado: " + dto.professorCriadorId()));

        if (professor.getPerfil() != PerfilUsuario.PROFESSOR && professor.getPerfil() != PerfilUsuario.ADMINISTRADOR) {
            throw new IllegalArgumentException("Apenas docentes ou administradores podem criar cenários clínicos.");
        }

        CenarioClinico c = new CenarioClinico();
        c.setProfessorCriador(professor);
        c.setTitulo(dto.titulo() != null ? dto.titulo().trim() : "");
        c.setDescricaoPedagogica(dto.descricaoPedagogica() != null ? dto.descricaoPedagogica().trim() : "");
        c.setObjetivosAprendizagem(dto.objetivosAprendizagem() != null ? dto.objetivosAprendizagem().trim() : "");

        return CenarioClinicoRespostaDTO.deEntidade(cenarioRepositorio.save(c));
    }

    @Transactional
    public CenarioClinicoRespostaDTO editar(Long id, CenarioClinicoRequisicaoDTO dto) {
        CenarioClinico c = cenarioRepositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Cenário clínico não encontrado: " + id));

        Usuario professor = usuarioRepositorio.findById(dto.professorCriadorId())
                .orElseThrow(() -> new NoSuchElementException("Professor criador não encontrado: " + dto.professorCriadorId()));

        c.setProfessorCriador(professor);
        c.setTitulo(dto.titulo() != null ? dto.titulo().trim() : "");
        c.setDescricaoPedagogica(dto.descricaoPedagogica() != null ? dto.descricaoPedagogica().trim() : "");
        c.setObjetivosAprendizagem(dto.objetivosAprendizagem() != null ? dto.objetivosAprendizagem().trim() : "");

        return CenarioClinicoRespostaDTO.deEntidade(cenarioRepositorio.save(c));
    }

    @Transactional
    public void excluir(Long id) {
        CenarioClinico c = cenarioRepositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Cenário clínico não encontrado: " + id));
        cenarioRepositorio.delete(c);
    }
}
