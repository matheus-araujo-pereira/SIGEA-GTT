package br.ufs.dcomp.sigeagtt.modulos.gtt.servico;

import br.ufs.dcomp.sigeagtt.modulos.gtt.dto.GatilhoGttRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.gtt.modelo.GatilhoGtt;
import br.ufs.dcomp.sigeagtt.modulos.gtt.modelo.ModuloGtt;
import br.ufs.dcomp.sigeagtt.modulos.gtt.repositorio.GatilhoGttRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.gtt.repositorio.ModuloGttRepositorio;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.NoSuchElementException;

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
            return gatilhoRepositorio.findAllByModuloId(moduloId);
        }
        return gatilhoRepositorio.findAllOrderByCodigo();
    }

    @Transactional(readOnly = true)
    public GatilhoGtt buscarPorId(Long id) {
        return gatilhoRepositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Gatilho não encontrado com o ID: " + id));
    }

    @Transactional
    public GatilhoGtt cadastrar(GatilhoGttRequisicaoDTO dto) {
        String codigo = dto.codigo() != null ? dto.codigo().trim().toUpperCase() : "";
        String desc = dto.descricao() != null ? dto.descricao().trim() : "";
        String limiar = dto.limiarReferencia() != null ? dto.limiarReferencia().trim() : null;

        if (gatilhoRepositorio.findByCodigo(codigo).isPresent()) {
            throw new IllegalArgumentException("Já existe um gatilho cadastrado com o código: " + codigo);
        }

        ModuloGtt modulo = moduloRepositorio.findById(dto.moduloId())
                .orElseThrow(() -> new NoSuchElementException("Módulo não encontrado com o ID: " + dto.moduloId()));

        GatilhoGtt gatilho = new GatilhoGtt();
        gatilho.setCodigo(codigo);
        gatilho.setModulo(modulo);
        gatilho.setDescricao(desc);
        gatilho.setLimiarReferencia(limiar);
        gatilho.setAtivo(true);

        return gatilhoRepositorio.save(gatilho);
    }

    @Transactional
    public GatilhoGtt editar(Long id, GatilhoGttRequisicaoDTO dto) {
        GatilhoGtt gatilho = buscarPorId(id);

        String codigo = dto.codigo() != null ? dto.codigo().trim().toUpperCase() : "";
        String desc = dto.descricao() != null ? dto.descricao().trim() : "";
        String limiar = dto.limiarReferencia() != null ? dto.limiarReferencia().trim() : null;

        if (gatilhoRepositorio.findByCodigoAndIdNot(codigo, id).isPresent()) {
            throw new IllegalArgumentException("O código '" + codigo + "' já está em uso por outro gatilho.");
        }

        ModuloGtt modulo = moduloRepositorio.findById(dto.moduloId())
                .orElseThrow(() -> new NoSuchElementException("Módulo não encontrado com o ID: " + dto.moduloId()));

        gatilho.setCodigo(codigo);
        gatilho.setModulo(modulo);
        gatilho.setDescricao(desc);
        gatilho.setLimiarReferencia(limiar);

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
