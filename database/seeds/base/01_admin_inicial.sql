-- =============================================================================
-- SIGEA-GTT: Semente Base - Usuário Administrador Inicial
-- Arquivo: database/seeds/base/01_admin_inicial.sql
-- Credenciais: matheusaraujopereira@academico.ufs.br | Senha: Sigea@123
-- =============================================================================

INSERT INTO usuarios (
    nome_completo,
    email,
    matricula_sigaa,
    perfil,
    senha,
    primeiro_acesso,
    ativo
) VALUES (
    'Matheus Araujo Pereira',
    'matheusaraujopereira@academico.ufs.br',
    NULL,
    'ADMINISTRADOR',
    '$2a$10$QrlMhf/Wah7PtuldYOCIOevxYBCx1f0pxoKLSJe5fmyiqzIotQ/M6',
    FALSE,
    TRUE
) ON CONFLICT (email) DO UPDATE
SET nome_completo = EXCLUDED.nome_completo,
    senha = EXCLUDED.senha,
    perfil = EXCLUDED.perfil,
    ativo = TRUE;

