-- =============================================================================
-- SIGEA-GTT: Migração de Módulos para Tabela Dinâmica com CRUD Total
-- =============================================================================

-- 1. Criar tabela de Módulos GTT
CREATE TABLE modulos_gtt (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Carga dos Módulos Oficiais do IHI
INSERT INTO modulos_gtt (codigo, nome, descricao, ativo) VALUES
  ('CUIDADOS', 'Módulo Cuidados', 'Rastreadores gerais de cuidados assistenciais e monitorização clínica', true),
  ('MEDICACAO', 'Módulo Medicação', 'Rastreadores de eventos adversos associados a fármacos e toxicidade', true),
  ('CIRURGICO', 'Módulo Cirúrgico', 'Rastreadores no perioperatório, bloco cirúrgico e anestesia', true),
  ('TERAPIA_INTENSIVA', 'Módulo Cuidados Intensivos/Terapia Intensiva', 'Rastreadores críticos em unidade de terapia intensiva', true),
  ('PERINATAL', 'Módulo Perinatal', 'Rastreadores obstétricos e materno-fetais', true),
  ('EMERGENCIA', 'Módulo Serviço de Urgência/Pronto Atendimento', 'Rastreadores de urgência, tempo de permanência e complicações agudas', true);

-- 3. Adicionar chave estrangeira em gatilhos_gtt
ALTER TABLE gatilhos_gtt ADD COLUMN modulo_id BIGINT REFERENCES modulos_gtt(id) ON DELETE CASCADE;

-- 4. Migrar os dados existentes
UPDATE gatilhos_gtt g
SET modulo_id = m.id
FROM modulos_gtt m
WHERE g.modulo::text = m.codigo;

ALTER TABLE gatilhos_gtt ALTER COLUMN modulo_id SET NOT NULL;
ALTER TABLE gatilhos_gtt DROP COLUMN modulo;

CREATE INDEX idx_gatilhos_modulo_id ON gatilhos_gtt(modulo_id);
