-- =============================================================================
-- SIGEA-GTT: Adicionar valor PERINATAL ao enum modulo_gtt_enum (Commit isolado)
-- =============================================================================
ALTER TYPE modulo_gtt_enum ADD VALUE IF NOT EXISTS 'PERINATAL';
