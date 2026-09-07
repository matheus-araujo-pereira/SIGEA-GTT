package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.GatilhoGtt;
import br.ufs.dcomp.sigeagtt.modelos.ModuloGtt;
import br.ufs.dcomp.sigeagtt.repositorios.GatilhoGttRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.ModuloGttRepositorio;
import br.ufs.dcomp.sigeagtt.transferencia.GatilhoGttRequisicaoDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GatilhoGttServico {

    private final GatilhoGttRepositorio gatilhoRepositorio;
    private final ModuloGttRepositorio moduloRepositorio;

    public GatilhoGttServico(GatilhoGttRepositorio gatilhoRepositorio, ModuloGttRepositorio moduloRepositorio) {
        this.gatilhoRepositorio = gatilhoRepositorio;
        this.moduloRepositorio = moduloRepositorio;
    }

    @Transactional(readOnly = true)
    public List<GatilhoGtt> listar(Long moduloId) {
        if (moduloId != null) {
            return gatilhoRepositorio.findByModuloId(moduloId);
        }
        return gatilhoRepositorio.findAll();
    }

    @Transactional(readOnly = true)
    public GatilhoGtt buscarPorId(Long id) {
        return gatilhoRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Gatilho não encontrado com o ID: " + id));
    }

    @Transactional
    public GatilhoGtt cadastrar(GatilhoGttRequisicaoDTO dto) {
        if (gatilhoRepositorio.findByCodigo(dto.codigo()).isPresent()) {
            throw new IllegalArgumentException("Já existe um gatilho cadastrado com o código: " + dto.codigo());
        }

        ModuloGtt modulo = moduloRepositorio.findById(dto.moduloId())
                .orElseThrow(() -> new IllegalArgumentException("Módulo não encontrado com o ID: " + dto.moduloId()));

        GatilhoGtt gatilho = new GatilhoGtt();
        gatilho.setCodigo(dto.codigo());
        gatilho.setModulo(modulo);
        gatilho.setDescricao(dto.descricao());
        gatilho.setLimiarReferencia(dto.limiarReferencia());
        gatilho.setAtivo(true);

        return gatilhoRepositorio.save(gatilho);
    }

    @Transactional
    public GatilhoGtt editar(Long id, GatilhoGttRequisicaoDTO dto) {
        GatilhoGtt gatilho = buscarPorId(id);

        if (gatilhoRepositorio.findByCodigoAndIdNot(dto.codigo(), id).isPresent()) {
            throw new IllegalArgumentException("O código '" + dto.codigo() + "' já está em uso por outro gatilho.");
        }

        ModuloGtt modulo = moduloRepositorio.findById(dto.moduloId())
                .orElseThrow(() -> new IllegalArgumentException("Módulo não encontrado com o ID: " + dto.moduloId()));

        gatilho.setCodigo(dto.codigo());
        gatilho.setModulo(modulo);
        gatilho.setDescricao(dto.descricao());
        gatilho.setLimiarReferencia(dto.limiarReferencia());

        return gatilhoRepositorio.save(gatilho);
    }

    @Transactional
    public void excluir(Long id) {
        GatilhoGtt gatilho = buscarPorId(id);
        gatilhoRepositorio.delete(gatilho);
    }

    @Transactional
    public GatilhoGtt alternarStatus(Long id) {
        GatilhoGtt gatilho = buscarPorId(id);
        gatilho.setAtivo(!Boolean.TRUE.equals(gatilho.getAtivo()));
        return gatilhoRepositorio.save(gatilho);
    }
}
