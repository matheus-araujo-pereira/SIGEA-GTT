package br.ufs.dcomp.sigeagtt.modulos.auditoria.servico;

import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.AtividadeAuditoriaRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.dto.AtividadeAuditoriaRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.modelo.AtividadeAuditoria;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.AtividadeAuditoriaRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.auditoria.repositorio.RevisaoIndividualRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.cenario.modelo.CenarioClinico;
import br.ufs.dcomp.sigeagtt.modulos.cenario.repositorio.CenarioClinicoRepositorio;
import br.ufs.dcomp.sigeagtt.modulos.turma.modelo.Turma;
import br.ufs.dcomp.sigeagtt.modulos.turma.repositorio.TurmaRepositorio;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AtividadeAuditoriaServico {

    private final AtividadeAuditoriaRepositorio atividadeRepositorio;
    private final TurmaRepositorio turmaRepositorio;
    private final CenarioClinicoRepositorio cenarioRepositorio;
    private final RevisaoIndividualRepositorio revisaoRepositorio;

    public AtividadeAuditoriaServico(AtividadeAuditoriaRepositorio atividadeRepositorio,
            TurmaRepositorio turmaRepositorio,
            CenarioClinicoRepositorio cenarioRepositorio,
            RevisaoIndividualRepositorio revisaoRepositorio) {
        this.atividadeRepositorio = atividadeRepositorio;
        this.turmaRepositorio = turmaRepositorio;
        this.cenarioRepositorio = cenarioRepositorio;
        this.revisaoRepositorio = revisaoRepositorio;
    }

    @Transactional(readOnly = true)
    public List<AtividadeAuditoriaRespostaDTO> listar(Long turmaId) {
        List<AtividadeAuditoria> lista = (turmaId != null)
                ? atividadeRepositorio.findByTurmaId(turmaId)
                : atividadeRepositorio.findAll();

        return lista.stream().map(a -> {
            long totalAuditorias = revisaoRepositorio.countByAtividadeId(a.getId());
            return AtividadeAuditoriaRespostaDTO.deEntidade(a, totalAuditorias);
        }).toList();
    }

    @Transactional(readOnly = true)
    public AtividadeAuditoriaRespostaDTO buscarPorId(Long id) {
        AtividadeAuditoria a = atividadeRepositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Atividade de auditoria não encontrada: " + id));
        long totalAuditorias = revisaoRepositorio.countByAtividadeId(a.getId());
        return AtividadeAuditoriaRespostaDTO.deEntidade(a, totalAuditorias);
    }

    @Transactional
    public AtividadeAuditoriaRespostaDTO cadastrar(AtividadeAuditoriaRequisicaoDTO dto) {
        Turma turma = turmaRepositorio.findById(dto.turmaId())
                .orElseThrow(() -> new NoSuchElementException("Turma não encontrada: " + dto.turmaId()));

        CenarioClinico cenario = cenarioRepositorio.findById(dto.cenarioId())
                .orElseThrow(() -> new NoSuchElementException("Cenário clínico não encontrado: " + dto.cenarioId()));

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
                .orElseThrow(() -> new NoSuchElementException("Atividade de auditoria não encontrada: " + id));

        Turma turma = turmaRepositorio.findById(dto.turmaId())
                .orElseThrow(() -> new NoSuchElementException("Turma não encontrada: " + dto.turmaId()));

        CenarioClinico cenario = cenarioRepositorio.findById(dto.cenarioId())
                .orElseThrow(() -> new NoSuchElementException("Cenário clínico não encontrado: " + dto.cenarioId()));

        if (dto.dataFim().isBefore(dto.dataInicio())) {
            throw new IllegalArgumentException("A data de término não pode ser anterior à data de início.");
        }

        a.setTurma(turma);
        a.setCenario(cenario);
        a.setTitulo(dto.titulo());
        a.setDataInicio(dto.dataInicio());
        a.setDataFim(dto.dataFim());
        a.setTempoLimiteMinutos(dto.tempoLimiteMinutos());

        long totalAuditorias = revisaoRepositorio.countByAtividadeId(a.getId());
        return AtividadeAuditoriaRespostaDTO.deEntidade(atividadeRepositorio.save(a), totalAuditorias);
    }

    @Transactional
    public void excluir(Long id) {
        AtividadeAuditoria a = atividadeRepositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Atividade não encontrada: " + id));
        atividadeRepositorio.delete(a);
    }

    @Transactional
    public AtividadeAuditoriaRespostaDTO alternarFinalizada(Long id) {
        AtividadeAuditoria a = atividadeRepositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Atividade não encontrada: " + id));
        a.setFinalizada(!Boolean.TRUE.equals(a.getFinalizada()));
        long totalAuditorias = revisaoRepositorio.countByAtividadeId(a.getId());
        return AtividadeAuditoriaRespostaDTO.deEntidade(atividadeRepositorio.save(a), totalAuditorias);
    }
}
