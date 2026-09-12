-- =============================================================================
-- SIGEA-GTT: Semente Base - Categorias Oficiais de Eventos Adversos
-- Arquivo: database/seeds/base/04_categorias_eventos_adversos.sql
-- =============================================================================

INSERT INTO categorias_eventos_adversos (nome, definicao_operacional, ativa) VALUES
    ('Infecções Relacionadas à Assistência (IRAS)', 'Infecções diagnosticadas após 48 horas da admissão hospitalar ou associadas a procedimentos e dispositivos invasivos.', true),
    ('Eventos Adversos a Medicamentos (RAM / EAM)', 'Danos temporários ou permanentes decorrentes do uso, dosagem incorreta, toxicidade ou reação adversa a fármacos.', true),
    ('Complicações Cirúrgicas e Procedimentais', 'Danos decorrentes de intervenções cirúrgicas, atos anestésicos ou procedimentos invasivos no perioperatório.', true),
    ('Eventos Perinatais e Obstétricos', 'Danos à saúde materna ou fetal/neonatal decorrentes da assistência ao pré-parto, parto e puerpério imediato.', true),
    ('Danos Físicos, Quedas e Lesões por Pressão', 'Lesões corporais decorrentes de quedas nas instalações hospitalares ou lesões por pressão adquiridas.', true)
ON CONFLICT (nome) DO UPDATE
SET definicao_operacional = EXCLUDED.definicao_operacional,
    ativa = EXCLUDED.ativa;

