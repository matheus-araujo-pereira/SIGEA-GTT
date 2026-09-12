-- =============================================================================
-- SIGEA-GTT: Semente Base - Unidades Hospitalares Assistenciais (HU-UFS)
-- Arquivo: database/seeds/base/02_unidades_hu.sql
-- =============================================================================

INSERT INTO unidades_hospitalares (nome, sigla, ativa) VALUES
    ('Clínica Médica Geral', 'CMED', true),
    ('Clínica Cirúrgica / Bloco Operatório', 'CCIR', true),
    ('Unidade de Terapia Intensiva Adulto', 'UTI-A', true),
    ('Maternidade / Alojamento Conjunto', 'MAT', true),
    ('Serviço de Urgência e Emergência', 'SUE', true),
    ('Unidade de Recuperação Pós-Anestésica', 'URPA', true)
ON CONFLICT DO NOTHING;

