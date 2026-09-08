ALTER TABLE revisoes_individuais
    ADD COLUMN atividade_id BIGINT REFERENCES atividades_auditoria(id);

ALTER TABLE revisoes_individuais
    ALTER COLUMN dupla_id DROP NOT NULL;

CREATE INDEX idx_revisoes_atividade ON revisoes_individuais(atividade_id);
CREATE UNIQUE INDEX uq_revisao_individual_direta
    ON revisoes_individuais(atividade_id, aluno_id, prontuario_id)
    WHERE atividade_id IS NOT NULL;

ALTER TABLE validacoes_docentes
    ADD COLUMN revisao_individual_id BIGINT REFERENCES revisoes_individuais(id);

ALTER TABLE validacoes_docentes
    ALTER COLUMN consenso_dupla_id DROP NOT NULL;

CREATE UNIQUE INDEX uq_validacao_revisao_individual
    ON validacoes_docentes(revisao_individual_id)
    WHERE revisao_individual_id IS NOT NULL;
