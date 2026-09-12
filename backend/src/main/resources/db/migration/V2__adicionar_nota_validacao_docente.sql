-- =============================================================================
-- SIGEA-GTT: Adição de nota numérica de 1 a 10 para validação docente de auditorias
-- Migração Flyway V2
-- =============================================================================

ALTER TABLE validacoes_docentes ADD COLUMN IF NOT EXISTS nota NUMERIC(4,2);

