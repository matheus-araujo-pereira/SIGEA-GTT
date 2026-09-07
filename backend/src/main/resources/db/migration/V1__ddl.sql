-- =============================================================================
-- SIGEA-GTT: Sistema Inteligente de Gestão de Eventos Adversos - Global Trigger Tool
-- Script DDL Consolidado e Zerado (PostgreSQL 16+)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. LIMPEZA TOTAL (DROP TABLES E TIPOS ENUMERADOS)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS ciclos_pdca CASCADE;
DROP TABLE IF EXISTS planos_acao_5w3h CASCADE;
DROP TABLE IF EXISTS analises_ishikawa CASCADE;
DROP TABLE IF EXISTS validacoes_docentes CASCADE;
DROP TABLE IF EXISTS itens_consenso CASCADE;
DROP TABLE IF EXISTS consensos_duplas CASCADE;
DROP TABLE IF EXISTS achados_gatilhos CASCADE;
DROP TABLE IF EXISTS revisoes_individuais CASCADE;
DROP TABLE IF EXISTS duplas_revisores CASCADE;
DROP TABLE IF EXISTS atividades_auditoria CASCADE;
DROP TABLE IF EXISTS prontuarios_simulados CASCADE;
DROP TABLE IF EXISTS cenarios_clinicos CASCADE;
DROP TABLE IF EXISTS turma_alunos CASCADE;
DROP TABLE IF EXISTS turmas CASCADE;
DROP TABLE IF EXISTS categorias_eventos_adversos CASCADE;
DROP TABLE IF EXISTS gatilhos_gtt CASCADE;
DROP TABLE IF EXISTS modulos_gtt CASCADE;
DROP TABLE IF EXISTS unidades_hospitalares CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS gravidade_ncc_merp_enum CASCADE;
DROP TYPE IF EXISTS perfil_usuario_enum CASCADE;
DROP TYPE IF EXISTS modulo_gtt_enum CASCADE;

-- -----------------------------------------------------------------------------
-- 2. TIPOS ENUMERADOS (ENUMS)
-- -----------------------------------------------------------------------------
CREATE TYPE perfil_usuario_enum AS ENUM (
    'ADMINISTRADOR',
    'PROFESSOR',
    'ALUNO'
);

CREATE TYPE gravidade_ncc_merp_enum AS ENUM (
    'CATEGORIA_E', -- Dano temporário com necessidade de intervenção
    'CATEGORIA_F', -- Dano temporário com prolongamento de hospitalização
    'CATEGORIA_G', -- Dano permanente
    'CATEGORIA_H', -- Intervenção para suporte de vida (< 1h)
    'CATEGORIA_I'  -- Óbito com cuidado contribuinte
);

-- -----------------------------------------------------------------------------
-- 3. GESTÃO DE ACESSO E AUTENTICAÇÃO
-- -----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    cargo VARCHAR(100) NOT NULL,
    matricula_sigaa VARCHAR(12) UNIQUE,
    perfil perfil_usuario_enum NOT NULL,
    senha VARCHAR(255) NOT NULL,
    primeiro_acesso BOOLEAN NOT NULL DEFAULT TRUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. CONFIGURAÇÕES HOSPITALARES E METODOLOGIA IHI-GTT
-- -----------------------------------------------------------------------------
CREATE TABLE unidades_hospitalares (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    sigla VARCHAR(20) NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE modulos_gtt (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gatilhos_gtt (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    modulo_id BIGINT NOT NULL REFERENCES modulos_gtt(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    limiar_referencia VARCHAR(150),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE categorias_eventos_adversos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    definicao_operacional TEXT NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE
);

-- -----------------------------------------------------------------------------
-- 5. AMBIENTE ACADÊMICO, TURMAS E PRONTUÁRIOS SIMULADOS
-- -----------------------------------------------------------------------------
CREATE TABLE turmas (
    id BIGSERIAL PRIMARY KEY,
    professor_responsavel_id BIGINT NOT NULL REFERENCES usuarios(id),
    codigo_disciplina VARCHAR(30) NOT NULL,
    periodo_letivo VARCHAR(20) NOT NULL,
    ano_semestre VARCHAR(10) NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE turma_alunos (
    turma_id BIGINT NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    aluno_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    matriculado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (turma_id, aluno_id)
);

CREATE TABLE cenarios_clinicos (
    id BIGSERIAL PRIMARY KEY,
    professor_criador_id BIGINT NOT NULL REFERENCES usuarios(id),
    titulo VARCHAR(150) NOT NULL,
    descricao_pedagogica TEXT NOT NULL,
    objetivos_aprendizagem TEXT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prontuarios_simulados (
    id BIGSERIAL PRIMARY KEY,
    cenario_id BIGINT NOT NULL REFERENCES cenarios_clinicos(id) ON DELETE CASCADE,
    unidade_hospitalar_id BIGINT NOT NULL REFERENCES unidades_hospitalares(id),
    numero_atendimento VARCHAR(50) NOT NULL,
    idade_paciente INTEGER NOT NULL,
    data_admissao DATE NOT NULL,
    data_alta DATE NOT NULL,
    tempo_permanencia_dias INTEGER NOT NULL,
    sumario_alta TEXT NOT NULL,
    prescricoes_medicas TEXT NOT NULL,
    exames_laboratoriais TEXT NOT NULL,
    relatorio_cirurgico TEXT,
    evolucoes_multiprofissionais TEXT NOT NULL
);

CREATE TABLE atividades_auditoria (
    id BIGSERIAL PRIMARY KEY,
    turma_id BIGINT NOT NULL REFERENCES turmas(id),
    cenario_id BIGINT NOT NULL REFERENCES cenarios_clinicos(id),
    titulo VARCHAR(150) NOT NULL,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    tempo_limite_minutos INTEGER NOT NULL DEFAULT 20,
    finalizada BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE duplas_revisores (
    id BIGSERIAL PRIMARY KEY,
    atividade_id BIGINT NOT NULL REFERENCES atividades_auditoria(id) ON DELETE CASCADE,
    aluno_revisor_1_id BIGINT NOT NULL REFERENCES usuarios(id),
    aluno_revisor_2_id BIGINT NOT NULL REFERENCES usuarios(id),
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_dupla_revisores_atividade UNIQUE (atividade_id, aluno_revisor_1_id, aluno_revisor_2_id)
);

-- -----------------------------------------------------------------------------
-- 6. REVISÃO RETROSPECTIVA, CONSENSO E HOMOLOGAÇÃO DOCENTE
-- -----------------------------------------------------------------------------
CREATE TABLE revisoes_individuais (
    id BIGSERIAL PRIMARY KEY,
    dupla_id BIGINT NOT NULL REFERENCES duplas_revisores(id) ON DELETE CASCADE,
    aluno_id BIGINT NOT NULL REFERENCES usuarios(id),
    prontuario_id BIGINT NOT NULL REFERENCES prontuarios_simulados(id),
    tempo_gasto_segundos INTEGER NOT NULL DEFAULT 0,
    finalizada BOOLEAN NOT NULL DEFAULT FALSE,
    data_submissao TIMESTAMP,
    CONSTRAINT uq_revisao_individual UNIQUE (dupla_id, aluno_id, prontuario_id)
);

CREATE TABLE achados_gatilhos (
    id BIGSERIAL PRIMARY KEY,
    revisao_individual_id BIGINT NOT NULL REFERENCES revisoes_individuais(id) ON DELETE CASCADE,
    gatilho_id BIGINT NOT NULL REFERENCES gatilhos_gtt(id),
    categoria_ea_id BIGINT REFERENCES categorias_eventos_adversos(id),
    confirmou_dano BOOLEAN NOT NULL DEFAULT FALSE,
    justificativa_dano TEXT,
    dano_presente_admissao BOOLEAN NOT NULL DEFAULT FALSE,
    gravidade gravidade_ncc_merp_enum
);

CREATE TABLE consensos_duplas (
    id BIGSERIAL PRIMARY KEY,
    dupla_id BIGINT NOT NULL REFERENCES duplas_revisores(id) ON DELETE CASCADE,
    prontuario_id BIGINT NOT NULL REFERENCES prontuarios_simulados(id),
    data_consenso TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submetido BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_consenso_dupla UNIQUE (dupla_id, prontuario_id)
);

CREATE TABLE itens_consenso (
    id BIGSERIAL PRIMARY KEY,
    consenso_dupla_id BIGINT NOT NULL REFERENCES consensos_duplas(id) ON DELETE CASCADE,
    gatilho_id BIGINT NOT NULL REFERENCES gatilhos_gtt(id),
    categoria_ea_id BIGINT REFERENCES categorias_eventos_adversos(id),
    confirmou_dano BOOLEAN NOT NULL DEFAULT FALSE,
    justificativa_dano TEXT,
    dano_presente_admissao BOOLEAN NOT NULL DEFAULT FALSE,
    gravidade_consenso gravidade_ncc_merp_enum NOT NULL,
    gravidade_homologada gravidade_ncc_merp_enum
);

CREATE TABLE validacoes_docentes (
    id BIGSERIAL PRIMARY KEY,
    consenso_dupla_id BIGINT NOT NULL UNIQUE REFERENCES consensos_duplas(id) ON DELETE CASCADE,
    professor_validador_id BIGINT NOT NULL REFERENCES usuarios(id),
    parecer_formativo TEXT NOT NULL,
    homologado BOOLEAN NOT NULL DEFAULT FALSE,
    data_validacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 7. FERRAMENTAS DE MELHORIA DA QUALIDADE (ISHIKAWA, 5W3H E PDCA)
-- -----------------------------------------------------------------------------
CREATE TABLE analises_ishikawa (
    id BIGSERIAL PRIMARY KEY,
    consenso_dupla_id BIGINT NOT NULL UNIQUE REFERENCES consensos_duplas(id) ON DELETE CASCADE,
    efeito_principal TEXT NOT NULL,
    metodo TEXT,
    mao_de_obra TEXT,
    material TEXT,
    medida TEXT,
    meio_ambiente TEXT,
    maquina TEXT
);

CREATE TABLE planos_acao_5w3h (
    id BIGSERIAL PRIMARY KEY,
    consenso_dupla_id BIGINT NOT NULL REFERENCES consensos_duplas(id) ON DELETE CASCADE,
    o_que TEXT NOT NULL,
    por_que TEXT NOT NULL,
    quem VARCHAR(100) NOT NULL,
    onde VARCHAR(100) NOT NULL,
    quando VARCHAR(100) NOT NULL,
    como TEXT NOT NULL,
    quanto_custa NUMERIC(12, 2),
    como_medir VARCHAR(150)
);

CREATE TABLE ciclos_pdca (
    id BIGSERIAL PRIMARY KEY,
    consenso_dupla_id BIGINT NOT NULL UNIQUE REFERENCES consensos_duplas(id) ON DELETE CASCADE,
    planejar TEXT NOT NULL,
    fazer TEXT NOT NULL,
    checar TEXT NOT NULL,
    agir TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- 8. ÍNDICES DE PERFORMANCE E CHAVES ESTRANGEIRAS
-- -----------------------------------------------------------------------------
CREATE INDEX idx_gatilhos_modulo_id ON gatilhos_gtt(modulo_id);
CREATE INDEX idx_turmas_professor ON turmas(professor_responsavel_id);
CREATE INDEX idx_turma_alunos_aluno ON turma_alunos(aluno_id);
CREATE INDEX idx_cenarios_professor ON cenarios_clinicos(professor_criador_id);
CREATE INDEX idx_prontuarios_cenario ON prontuarios_simulados(cenario_id);
CREATE INDEX idx_prontuarios_unidade ON prontuarios_simulados(unidade_hospitalar_id);
CREATE INDEX idx_atividades_turma ON atividades_auditoria(turma_id);
CREATE INDEX idx_atividades_cenario ON atividades_auditoria(cenario_id);
CREATE INDEX idx_duplas_atividade ON duplas_revisores(atividade_id);
CREATE INDEX idx_duplas_aluno1 ON duplas_revisores(aluno_revisor_1_id);
CREATE INDEX idx_duplas_aluno2 ON duplas_revisores(aluno_revisor_2_id);
CREATE INDEX idx_revisoes_dupla ON revisoes_individuais(dupla_id);
CREATE INDEX idx_revisoes_aluno ON revisoes_individuais(aluno_id);
CREATE INDEX idx_revisoes_prontuario ON revisoes_individuais(prontuario_id);
CREATE INDEX idx_achados_revisao ON achados_gatilhos(revisao_individual_id);
CREATE INDEX idx_achados_gatilho ON achados_gatilhos(gatilho_id);
CREATE INDEX idx_achados_categoria ON achados_gatilhos(categoria_ea_id);
CREATE INDEX idx_consensos_dupla ON consensos_duplas(dupla_id);
CREATE INDEX idx_consensos_prontuario ON consensos_duplas(prontuario_id);
CREATE INDEX idx_itens_consenso ON itens_consenso(consenso_dupla_id);
CREATE INDEX idx_itens_gatilho ON itens_consenso(gatilho_id);
CREATE INDEX idx_itens_categoria ON itens_consenso(categoria_ea_id);
CREATE INDEX idx_validacoes_professor ON validacoes_docentes(professor_validador_id);
CREATE INDEX idx_planos_5w3h_consenso ON planos_acao_5w3h(consenso_dupla_id);
