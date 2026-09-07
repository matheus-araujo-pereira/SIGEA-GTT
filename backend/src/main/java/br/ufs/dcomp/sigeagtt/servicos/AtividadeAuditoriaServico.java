package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.AtividadeAuditoria;
import br.ufs.dcomp.sigeagtt.modelos.CenarioClinico;
import br.ufs.dcomp.sigeagtt.modelos.Turma;
import br.ufs.dcomp.sigeagtt.repositorios.AtividadeAuditoriaRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.CenarioClinicoRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.DuplaRevisoresRepositorio;
import br.ufs.dcomp.sigeagtt.repositorios.TurmaRepositorio;
import br.ufs.dcomp.sigeagtt.transferencia.AtividadeAuditoriaRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.AtividadeAuditoriaRespostaDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AtividadeAuditoriaServico {

    private final AtividadeAuditoriaRepositorio atividadeRepositorio;
    private final TurmaRepositorio turmaRepositorio;
    private final CenarioClinicoRepositorio cenarioRepositorio;
    private final DuplaRevisoresRepositorio duplaRepositorio;

    public AtividadeAuditoriaServico(AtividadeAuditoriaRepositorio atividadeRepositorio,
                                    TurmaRepositorio turmaRepositorio,
                                    CenarioClinicoRepositorio cenarioRepositorio,
                                    DuplaRevisoresRepositorio duplaRepositorio) {
        this.atividadeRepositorio = atividadeRepositorio;
        this.turmaRepositorio = turmaRepositorio;
        this.cenarioRepositorio = cenarioRepositorio;
        this.duplaRepositorio = duplaRepositorio;
    }

    @Transactional(readOnly = true)
    public List<AtividadeAuditoriaRespostaDTO> listar(Long turmaId) {
        List<AtividadeAuditoria> lista = (turmaId != null)
                ? atividadeRepositorio.findByTurmaId(turmaId)
                : atividadeRepositorio.findAll();

        return lista.stream().map(a -> {
            long totalDuplas = duplaRepositorio.countByAtividadeId(a.getId());
            return AtividadeAuditoriaRespostaDTO.deEntidade(a, totalDuplas);
        }).toList();
    }

    @Transactional(readOnly = true)
    public AtividadeAuditoriaRespostaDTO buscarPorId(Long id) {
        AtividadeAuditoria a = atividadeRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Atividade de auditoria não encontrada: " + id));
        long totalDuplas = duplaRepositorio.countByAtividadeId(a.getId());
        return AtividadeAuditoriaRespostaDTO.deEntidade(a, totalDuplas);
    }

    @Transactional
    public AtividadeAuditoriaRespostaDTO cadastrar(AtividadeAuditoriaRequisicaoDTO dto) {
        Turma turma = turmaRepositorio.findById(dto.turmaId())
                .orElseThrow(() -> new IllegalArgumentException("Turma não encontrada: " + dto.turmaId()));

        CenarioClinico cenario = cenarioRepositorio.findById(dto.cenarioId())
                .orElseThrow(() -> new IllegalArgumentException("Cenário clínico não encontrado: " + dto.cenarioId()));

        if (dto.dataFim().isBefore(dto.dataInicio())) {
            throw new IllegalArgumentException("A data de término não pode ser anterior à data de início.");
        }

        AtividadeAuditoria a = new AtividadeAuditoria();
        a.setTurma(turma);
        a.setCenario(cenario);
        a.setTitulo(dto.titulo());
        a.setDataInicio(dto.dataInicio());
        a.setDataFim(dto.dataFim());
        a.setTempoLimiteMinutos(dto.tempoLimiteMinutos() != null ? dto.tempoLimiteMinutos() : 20);
        a.setFinalizada(false);

        return AtividadeAuditoriaRespostaDTO.deEntidade(atividadeRepositorio.save(a), 0);
    }

    @Transactional
    public AtividadeAuditoriaRespostaDTO editar(Long id, AtividadeAuditoriaRequisicaoDTO dto) {
        AtividadeAuditoria a = atividadeRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Atividade de auditoria não encontrada: " + id));

        Turma turma = turmaRepositorio.findById(dto.turmaId())
                .orElseThrow(() -> new IllegalArgumentException("Turma não encontrada: " + dto.turmaId()));

        CenarioClinico cenario = cenarioRepositorio.findById(dto.cenarioId())
                .orElseThrow(() -> new IllegalArgumentException("Cenário clínico não encontrado: " + dto.cenarioId()));

        if (dto.dataFim().isBefore(dto.dataInicio())) {
            throw new IllegalArgumentException("A data de término não pode ser anterior à data de início.");
        }

        a.setTurma(turma);
        a.setCenario(cenario);
        a.setTitulo(dto.titulo());
        a.setDataInicio(dto.dataInicio());
        a.setDataFim(dto.dataFim());
        a.setTempoLimiteMinutos(dto.tempoLimiteMinutos());

        long totalDuplas = duplaRepositorio.countByAtividadeId(a.getId());
        return AtividadeAuditoriaRespostaDTO.deEntidade(atividadeRepositorio.save(a), totalDuplas);
    }

    @Transactional
    public void excluir(Long id) {
        AtividadeAuditoria a = atividadeRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Atividade não encontrada: " + id));
        atividadeRepositorio.delete(a);
    }

    @Transactional
    public AtividadeAuditoriaRespostaDTO alternarFinalizada(Long id) {
        AtividadeAuditoria a = atividadeRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Atividade não encontrada: " + id));
        a.setFinalizada(!Boolean.TRUE.equals(a.getFinalizada()));
        long totalDuplas = duplaRepositorio.countByAtividadeId(a.getId());
        return AtividadeAuditoriaRespostaDTO.deEntidade(atividadeRepositorio.save(a), totalDuplas);
    }
}
