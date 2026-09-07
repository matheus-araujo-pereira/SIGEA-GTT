package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.ModuloGtt;
import br.ufs.dcomp.sigeagtt.repositorios.ModuloGttRepositorio;
import br.ufs.dcomp.sigeagtt.transferencia.ModuloGttRequisicaoDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ModuloGttServico {

    private final ModuloGttRepositorio repositorio;

    public ModuloGttServico(ModuloGttRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    @Transactional(readOnly = true)
    public List<ModuloGtt> listarTodos() {
        return repositorio.findAll();
    }

    @Transactional(readOnly = true)
    public ModuloGtt buscarPorId(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Módulo GTT não encontrado: " + id));
    }

    @Transactional
    public ModuloGtt cadastrar(ModuloGttRequisicaoDTO dto) {
        if (repositorio.findByCodigo(dto.codigo()).isPresent()) {
            throw new IllegalArgumentException("Já existe um módulo registrado com o código: " + dto.codigo());
        }
        ModuloGtt modulo = new ModuloGtt();
        modulo.setCodigo(dto.codigo());
        modulo.setNome(dto.nome());
        modulo.setDescricao(dto.descricao());
        modulo.setAtivo(true);
        return repositorio.save(modulo);
    }

    @Transactional
    public ModuloGtt editar(Long id, ModuloGttRequisicaoDTO dto) {
        ModuloGtt modulo = buscarPorId(id);
        if (repositorio.findByCodigoAndIdNot(dto.codigo(), id).isPresent()) {
            throw new IllegalArgumentException("O código '" + dto.codigo() + "' já pertence a outro módulo.");
        }
        modulo.setCodigo(dto.codigo());
        modulo.setNome(dto.nome());
        modulo.setDescricao(dto.descricao());
        return repositorio.save(modulo);
    }

    @Transactional
    public void excluir(Long id) {
        ModuloGtt modulo = buscarPorId(id);
        repositorio.delete(modulo);
    }

    @Transactional
    public ModuloGtt alternarStatus(Long id) {
        ModuloGtt modulo = buscarPorId(id);
        modulo.setAtivo(!Boolean.TRUE.equals(modulo.getAtivo()));
        return repositorio.save(modulo);
    }
}
