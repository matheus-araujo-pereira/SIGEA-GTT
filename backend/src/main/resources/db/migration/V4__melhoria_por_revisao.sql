ALTER TABLE analises_ishikawa
    ADD COLUMN revisao_individual_id BIGINT REFERENCES revisoes_individuais(id);
ALTER TABLE analises_ishikawa
    ALTER COLUMN consenso_dupla_id DROP NOT NULL;
CREATE UNIQUE INDEX uq_ishikawa_revisao_individual
    ON analises_ishikawa(revisao_individual_id)
    WHERE revisao_individual_id IS NOT NULL;

ALTER TABLE planos_acao_5w3h
    ADD COLUMN revisao_individual_id BIGINT REFERENCES revisoes_individuais(id);
ALTER TABLE planos_acao_5w3h
    ALTER COLUMN consenso_dupla_id DROP NOT NULL;
CREATE INDEX idx_planos_revisao_individual
    ON planos_acao_5w3h(revisao_individual_id);

ALTER TABLE ciclos_pdca
    ADD COLUMN revisao_individual_id BIGINT REFERENCES revisoes_individuais(id);
ALTER TABLE ciclos_pdca
    ALTER COLUMN consenso_dupla_id DROP NOT NULL;
CREATE UNIQUE INDEX uq_pdca_revisao_individual
    ON ciclos_pdca(revisao_individual_id)
    WHERE revisao_individual_id IS NOT NULL;
