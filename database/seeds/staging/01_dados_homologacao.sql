-- =============================================================================
-- SIGEA-GTT: Semente de Homologação (Staging)
-- Arquivo: database/seeds/staging/01_dados_homologacao.sql
-- Contém: 1 Professor, 1 Turma, 10 Alunos, 2 Cenários, 4 Prontuários e 1 Atividade
-- =============================================================================

DO $$
DECLARE
    v_prof_id BIGINT;
    v_turma_id BIGINT;
    v_aluno_id BIGINT;
    v_cenario1_id BIGINT;
    v_cenario2_id BIGINT;
    v_unidade_cmed BIGINT;
    v_unidade_utia BIGINT;
    v_pront1_id BIGINT;
    v_pront2_id BIGINT;
    v_atv_id BIGINT;
    i INT;
BEGIN
    -- Obter unidades hospitalares base
    SELECT id INTO v_unidade_cmed FROM unidades_hospitalares WHERE sigla = 'CMED' LIMIT 1;
    SELECT id INTO v_unidade_utia FROM unidades_hospitalares WHERE sigla = 'UTI-A' LIMIT 1;

    -- 1. Professor de Homologação
    INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
    VALUES (
        'Prof. Homologação GTT',
        'prof.homologacao@academico.ufs.br',
        NULL,
        'PROFESSOR',
        '$2a$10$QrlMhf/Wah7PtuldYOCIOevxYBCx1f0pxoKLSJe5fmyiqzIotQ/M6', -- Sigea@123
        false,
        true
    ) ON CONFLICT (email) DO UPDATE SET ativo = true
    RETURNING id INTO v_prof_id;

    -- 2. Turma de Homologação
    INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, periodo_letivo, ano_semestre, ativa)
    VALUES (v_prof_id, 'MED-HOMOLOG', '2026.1', '2026/1', true)
    RETURNING id INTO v_turma_id;

    -- 3. Matricular 10 Alunos de Teste
    FOR i IN 1..10 LOOP
        INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
        VALUES (
            'Aluno Homologação ' || LPAD(i::text, 2, '0'),
            'aluno.homolog' || LPAD(i::text, 2, '0') || '@academico.ufs.br',
            LPAD((2026000000 + i)::text, 12, '0'),
            'ALUNO',
            '$2a$10$QrlMhf/Wah7PtuldYOCIOevxYBCx1f0pxoKLSJe5fmyiqzIotQ/M6',
            false,
            true
        ) ON CONFLICT (email) DO UPDATE SET ativo = true
        RETURNING id INTO v_aluno_id;

        INSERT INTO turma_alunos (turma_id, aluno_id)
        VALUES (v_turma_id, v_aluno_id)
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- 4. Cenários Clínicos
    INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
    VALUES (
        v_prof_id,
        'Cenário Staging 1: Toxicidade Medicamentosa na Clínica Médica',
        'Avaliação retrospectiva de paciente idoso em uso de anticoagulantes com alargamento de INR.',
        'Identificar gatilhos M3 e M6, avaliar dano e propor plano 5W3H.'
    ) RETURNING id INTO v_cenario1_id;

    INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
    VALUES (
        v_prof_id,
        'Cenário Staging 2: Pneumonia Associada a Ventilação Mecânica na UTI',
        'Auditoria retrospectiva de paciente admitido em choque séptico que desenvolveu PAV na UTI.',
        'Identificar gatilhos I1 e C4, aplicar Ishikawa e ciclo PDCA.'
    ) RETURNING id INTO v_cenario2_id;

    -- 5. Prontuários Simulados
    INSERT INTO prontuarios_simulados (
        cenario_id, unidade_hospitalar_id, numero_atendimento, idade_paciente,
        data_admissao, data_alta, tempo_permanencia_dias, sumario_alta,
        prescricoes_medicas, exames_laboratoriais, evolucoes_multiprofissionais
    ) VALUES (
        v_cenario1_id, v_unidade_cmed, 'STG-PRONT-001', 68,
        CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '5 days', 10,
        'Paciente admitido por FA crônica. Desenvolveu epistaxe e hematoma após ajuste de Varfarina.',
        'Varfarina 5mg VO 1x/dia, Enoxaparina 40mg SC 1x/dia, Vitamina K 10mg EV.',
        'INR admissão: 2.1; INR D5: 7.4 (alargado); Hemoglobina: 11.2 -> 9.8 g/dL.',
        'D+5: Paciente apresentou epistaxe anterior moderada e hematoma em coxa esquerda.'
    ) RETURNING id INTO v_pront1_id;

    INSERT INTO prontuarios_simulados (
        cenario_id, unidade_hospitalar_id, numero_atendimento, idade_paciente,
        data_admissao, data_alta, tempo_permanencia_dias, sumario_alta,
        prescricoes_medicas, exames_laboratoriais, evolucoes_multiprofissionais
    ) VALUES (
        v_cenario2_id, v_unidade_utia, 'STG-PRONT-002', 54,
        CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '6 days', 14,
        'Internação em UTI para suporte ventilatório. Desenvolveu febre e secreção purulenta em TOT no D7.',
        'Meropenem 1g EV 8/8h, Vancomicina 1g EV 12/12h, Fentanil + Midazolam contínuo.',
        'Leucócitos: 18.500/mm³; Aspirado traqueal: Pseudomonas aeruginosa > 10^6 UFC/mL.',
        'D+7: Piora nos parâmetros ventilatórios, secreção purulenta volumosa. Iniciada antibioticoterapia guiada.'
    ) RETURNING id INTO v_pront2_id;

    -- 6. Atividade de Auditoria
    INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
    VALUES (
        v_turma_id, v_cenario1_id,
        'Atividade de Homologação: Auditoria de Eventos Medicamentosos',
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        CURRENT_TIMESTAMP + INTERVAL '10 days',
        20,
        false
    ) RETURNING id INTO v_atv_id;

    RAISE NOTICE 'Dados de homologação inseridos com sucesso! Turma ID: %, Atividade ID: %', v_turma_id, v_atv_id;
END $$;

