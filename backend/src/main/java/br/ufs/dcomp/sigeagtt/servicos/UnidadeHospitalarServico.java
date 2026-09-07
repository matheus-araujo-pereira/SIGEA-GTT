package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.UnidadeHospitalar;
import br.ufs.dcomp.sigeagtt.repositorios.UnidadeHospitalarRepositorio;
import br.ufs.dcomp.sigeagtt.transferencia.UnidadeHospitalarRequisicaoDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
                .orElseThrow(() -> new IllegalArgumentException("Unidade hospitalar não encontrada: " + id));
    }

    @Transactional
    public UnidadeHospitalar cadastrar(UnidadeHospitalarRequisicaoDTO dto) {
        if (repositorio.findBySigla(dto.sigla()).isPresent()) {
            throw new IllegalArgumentException("Já existe uma unidade cadastrada com a sigla: " + dto.sigla());
        }

        UnidadeHospitalar unidade = new UnidadeHospitalar();
        unidade.setSigla(dto.sigla());
        unidade.setNome(dto.nome());
        unidade.setAtiva(true);

        return repositorio.save(unidade);
    }

    @Transactional
    public UnidadeHospitalar editar(Long id, UnidadeHospitalarRequisicaoDTO dto) {
        UnidadeHospitalar unidade = buscarPorId(id);

        if (repositorio.findBySiglaAndIdNot(dto.sigla(), id).isPresent()) {
            throw new IllegalArgumentException("A sigla '" + dto.sigla() + "' já está em uso por outra unidade.");
        }

        unidade.setSigla(dto.sigla());
        unidade.setNome(dto.nome());

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
