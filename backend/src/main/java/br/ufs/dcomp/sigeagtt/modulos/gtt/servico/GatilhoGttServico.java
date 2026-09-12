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
        List<GatilhoGtt> lista;
        if (moduloId != null) {
            lista = gatilhoRepositorio.findAllByModuloId(moduloId);
        } else {
            lista = gatilhoRepositorio.findAllOrderByCodigo();
        }
        return ordenarNaturalmente(lista);
    }

    private List<GatilhoGtt> ordenarNaturalmente(List<GatilhoGtt> lista) {
        if (lista == null || lista.isEmpty()) {
            return lista;
        }
        java.util.List<GatilhoGtt> mutavel = new java.util.ArrayList<>(lista);
        mutavel.sort((g1, g2) -> {
            String mod1 = (g1.getModulo() != null && g1.getModulo().getCodigo() != null) ? g1.getModulo().getCodigo() : "";
            String mod2 = (g2.getModulo() != null && g2.getModulo().getCodigo() != null) ? g2.getModulo().getCodigo() : "";
            int cmpMod = mod1.compareToIgnoreCase(mod2);
            if (cmpMod != 0) {
                return cmpMod;
            }
            return compararCodigosNaturalmente(g1.getCodigo(), g2.getCodigo());
        });
        return mutavel;
    }

    private int compararCodigosNaturalmente(String cod1, String cod2) {
        if (cod1 == null) return cod2 == null ? 0 : -1;
        if (cod2 == null) return 1;

        String prefix1 = cod1.replaceAll("\\d", "");
        String prefix2 = cod2.replaceAll("\\d", "");
        int cmpPrefix = prefix1.compareToIgnoreCase(prefix2);
        if (cmpPrefix != 0) {
            return cmpPrefix;
        }

        String digits1 = cod1.replaceAll("\\D", "");
        String digits2 = cod2.replaceAll("\\D", "");
        if (!digits1.isEmpty() && !digits2.isEmpty()) {
            try {
                int n1 = Integer.parseInt(digits1);
                int n2 = Integer.parseInt(digits2);
                return Integer.compare(n1, n2);
            } catch (NumberFormatException ignored) {
            }
        }
        return cod1.compareToIgnoreCase(cod2);
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
