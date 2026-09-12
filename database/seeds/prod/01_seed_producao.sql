-- =============================================================================
-- SIGEA-GTT: Semente de Produção (Go-Live)
-- Arquivo: database/seeds/prod/01_seed_producao.sql
-- Aplica apenas o conjunto oficial estrito: Admin, Unidades HU, Módulos, Gatilhos e Categorias
-- =============================================================================

\ir ../base/01_admin_inicial.sql
\ir ../base/02_unidades_hu.sql
\ir ../base/03_modulos_gatilhos.sql
\ir ../base/04_categorias_eventos_adversos.sql

