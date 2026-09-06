-- =============================================================================
-- SIGEA-GTT: Adicionar Autenticação Local e Gestão de Senhas
-- =============================================================================

ALTER TABLE usuarios
  ADD COLUMN email VARCHAR(150) UNIQUE,
  ADD COLUMN senha VARCHAR(255) NOT NULL DEFAULT '$2a$10$wK1F5n8g1d3a5t2E7e8eYeO3V3eKz0c5L7lQ9t2bX1mZ0k.Sigea.',
  ADD COLUMN primeiro_acesso BOOLEAN NOT NULL DEFAULT TRUE;

-- Atualiza o e-mail do usuário inicial (ID 1)
UPDATE usuarios 
SET email = 'matharaupere@gmail.com' 
WHERE id = 1;
