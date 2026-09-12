package br.ufs.dcomp.sigeagtt.modulos.unidade.servico;

import br.ufs.dcomp.sigeagtt.modulos.unidade.dto.UnidadeHospitalarRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.unidade.modelo.UnidadeHospitalar;
import br.ufs.dcomp.sigeagtt.modulos.unidade.repositorio.UnidadeHospitalarRepositorio;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UnidadeHospitalarServico {

    private final UnidadeHospitalarRepositorio repositorio;

    public UnidadeHospitalarServico(UnidadeHospitalarRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    @Transactional(readOnly = true)
    public List<UnidadeHospitalar> listarTodos() {
        return repositorio.findAll();
    }

    @Transactional(readOnly = true)
    public UnidadeHospitalar buscarPorId(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Unidade hospitalar não encontrada: " + id));
    }

    @Transactional
    public UnidadeHospitalar cadastrar(UnidadeHospitalarRequisicaoDTO dto) {
        String sigla = dto.sigla() != null ? dto.sigla().trim().toUpperCase() : "";
        String nome = dto.nome() != null ? dto.nome().trim() : "";

        if (repositorio.findBySigla(sigla).isPresent()) {
            throw new IllegalArgumentException("Já existe uma unidade cadastrada com a sigla: " + sigla);
        }

        UnidadeHospitalar unidade = new UnidadeHospitalar();
        unidade.setSigla(sigla);
        unidade.setNome(nome);
        unidade.setAtiva(true);

        return repositorio.save(unidade);
    }

    @Transactional
    public UnidadeHospitalar editar(Long id, UnidadeHospitalarRequisicaoDTO dto) {
        UnidadeHospitalar unidade = buscarPorId(id);

        String sigla = dto.sigla() != null ? dto.sigla().trim().toUpperCase() : "";
        String nome = dto.nome() != null ? dto.nome().trim() : "";

        if (repositorio.findBySiglaAndIdNot(sigla, id).isPresent()) {
            throw new IllegalArgumentException("A sigla '" + sigla + "' já está em uso por outra unidade.");
        }

        unidade.setSigla(sigla);
        unidade.setNome(nome);

        return repositorio.save(unidade);
    }

    @Transactional
    public void excluir(Long id) {
        UnidadeHospitalar unidade = buscarPorId(id);
        repositorio.delete(unidade);
    }

    @Transactional
    public UnidadeHospitalar alternarStatus(Long id) {
        UnidadeHospitalar unidade = buscarPorId(id);
        unidade.setAtiva(!Boolean.TRUE.equals(unidade.getAtiva()));
        return repositorio.save(unidade);
    }
}
