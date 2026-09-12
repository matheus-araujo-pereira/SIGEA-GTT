-- =============================================================================
-- SIGEA-GTT: Script DML de Simulação Clínica Realista (HU-UFS / EBSERH)
-- Período Temporal: Janeiro de 2026 a Setembro de 2026 (Mês Atual)
-- 100% Fiel à Metodologia Global Trigger Tool (IHI GTT - 2ª Edição)
-- =============================================================================

DO $$
DECLARE
  -- Senha padrão para todos os usuários: Sigea@123
  v_senha TEXT := '$2a$10$QrlMhf/Wah7PtuldYOCIOevxYBCx1f0pxoKLSJe5fmyiqzIotQ/M6';

  -- Professores
  prof_roberto BIGINT;
  prof_marina  BIGINT;
  prof_fernando BIGINT;

  -- Turmas (2026.1 e 2026.2)
  t_cmed_26_1 BIGINT;
  t_ccir_26_1 BIGINT;
  t_uti_26_2  BIGINT;
  t_qual_26_2 BIGINT;

  -- Alunos
  aluno_ids BIGINT[] := ARRAY[]::BIGINT[];
  v_aluno_id BIGINT;

  -- Unidades Hospitalares
  uh_cmed BIGINT;
  uh_ccir BIGINT;
  uh_utia BIGINT;
  uh_mat  BIGINT;
  uh_sue  BIGINT;
  uh_urpa BIGINT;

  -- Categorias de Eventos Adversos
  cat_iras   BIGINT;
  cat_ram    BIGINT;
  cat_cirurg BIGINT;
  cat_obst   BIGINT;
  cat_quedas BIGINT;

  -- Gatilhos GTT Carregados
  gat_c1 BIGINT; gat_c2 BIGINT; gat_c3 BIGINT; gat_c4 BIGINT; gat_c6 BIGINT; gat_c7 BIGINT; gat_c8 BIGINT; gat_c11 BIGINT; gat_c13 BIGINT;
  gat_m1 BIGINT; gat_m2 BIGINT; gat_m3 BIGINT; gat_m4 BIGINT; gat_m5 BIGINT; gat_m6 BIGINT; gat_m9 BIGINT; gat_m12 BIGINT;
  gat_s1 BIGINT; gat_s3 BIGINT; gat_s4 BIGINT; gat_s7 BIGINT; gat_s10 BIGINT; gat_s11 BIGINT;
  gat_i1 BIGINT; gat_i2 BIGINT; gat_i3 BIGINT; gat_i4 BIGINT;
  gat_p2 BIGINT; gat_p3 BIGINT; gat_p4 BIGINT; gat_p6 BIGINT; gat_p7 BIGINT;
  gat_e1 BIGINT; gat_e2 BIGINT;

  -- Cenários Clínicos
  cen1 BIGINT; cen2 BIGINT; cen3 BIGINT; cen4 BIGINT; cen5 BIGINT;

  -- Prontuários (array com 36 prontuários distribuídos de Jan/2026 a Set/2026)
  p_id BIGINT;
  pront_ids BIGINT[] := ARRAY[]::BIGINT[];

  -- Atividades
  atv1 BIGINT; atv2 BIGINT; atv3 BIGINT; atv4 BIGINT;

  -- Variáveis de iteração
  v_rev_id BIGINT;
  i INT;
BEGIN

  -- ---------------------------------------------------------------------------
  -- 1. IDENTIFICAR UNIDADES HOSPITALARES
  -- ---------------------------------------------------------------------------
  SELECT id INTO uh_cmed FROM unidades_hospitalares WHERE sigla = 'CMED' LIMIT 1;
  SELECT id INTO uh_ccir FROM unidades_hospitalares WHERE sigla = 'CCIR' LIMIT 1;
  SELECT id INTO uh_utia FROM unidades_hospitalares WHERE sigla = 'UTI-A' LIMIT 1;
  SELECT id INTO uh_mat  FROM unidades_hospitalares WHERE sigla = 'MAT' LIMIT 1;
  SELECT id INTO uh_sue  FROM unidades_hospitalares WHERE sigla = 'SUE' LIMIT 1;
  SELECT id INTO uh_urpa FROM unidades_hospitalares WHERE sigla = 'URPA' LIMIT 1;

  -- Fallback de segurança caso unidades não existam
  IF uh_cmed IS NULL THEN
    INSERT INTO unidades_hospitalares (nome, sigla, ativa) VALUES ('Clínica Médica Geral', 'CMED', true) RETURNING id INTO uh_cmed;
  END IF;
  IF uh_ccir IS NULL THEN
    INSERT INTO unidades_hospitalares (nome, sigla, ativa) VALUES ('Clínica Cirúrgica / Bloco Operatório', 'CCIR', true) RETURNING id INTO uh_ccir;
  END IF;
  IF uh_utia IS NULL THEN
    INSERT INTO unidades_hospitalares (nome, sigla, ativa) VALUES ('Unidade de Terapia Intensiva Adulto', 'UTI-A', true) RETURNING id INTO uh_utia;
  END IF;
  IF uh_mat IS NULL THEN
    INSERT INTO unidades_hospitalares (nome, sigla, ativa) VALUES ('Maternidade / Alojamento Conjunto', 'MAT', true) RETURNING id INTO uh_mat;
  END IF;
  IF uh_sue IS NULL THEN
    INSERT INTO unidades_hospitalares (nome, sigla, ativa) VALUES ('Serviço de Urgência e Emergência', 'SUE', true) RETURNING id INTO uh_sue;
  END IF;
  IF uh_urpa IS NULL THEN
    INSERT INTO unidades_hospitalares (nome, sigla, ativa) VALUES ('Unidade de Recuperação Pós-Anestésica', 'URPA', true) RETURNING id INTO uh_urpa;
  END IF;

  -- ---------------------------------------------------------------------------
  -- 2. IDENTIFICAR CATEGORIAS DE EVENTOS ADVERSOS
  -- ---------------------------------------------------------------------------
  SELECT id INTO cat_iras   FROM categorias_eventos_adversos WHERE nome LIKE '%Infecções%' LIMIT 1;
  SELECT id INTO cat_ram    FROM categorias_eventos_adversos WHERE nome LIKE '%Medicamentos%' LIMIT 1;
  SELECT id INTO cat_cirurg FROM categorias_eventos_adversos WHERE nome LIKE '%Cirúrgicas%' LIMIT 1;
  SELECT id INTO cat_obst   FROM categorias_eventos_adversos WHERE nome LIKE '%Perinatais%' LIMIT 1;
  SELECT id INTO cat_quedas FROM categorias_eventos_adversos WHERE nome LIKE '%Quedas%' LIMIT 1;

  -- ---------------------------------------------------------------------------
  -- 3. IDENTIFICAR GATILHOS GTT PRINCIPAIS
  -- ---------------------------------------------------------------------------
  SELECT id INTO gat_c1  FROM gatilhos_gtt WHERE codigo = 'C1';
  SELECT id INTO gat_c2  FROM gatilhos_gtt WHERE codigo = 'C2';
  SELECT id INTO gat_c3  FROM gatilhos_gtt WHERE codigo = 'C3';
  SELECT id INTO gat_c4  FROM gatilhos_gtt WHERE codigo = 'C4';
  SELECT id INTO gat_c6  FROM gatilhos_gtt WHERE codigo = 'C6';
  SELECT id INTO gat_c7  FROM gatilhos_gtt WHERE codigo = 'C7';
  SELECT id INTO gat_c8  FROM gatilhos_gtt WHERE codigo = 'C8';
  SELECT id INTO gat_c11 FROM gatilhos_gtt WHERE codigo = 'C11';
  SELECT id INTO gat_c13 FROM gatilhos_gtt WHERE codigo = 'C13';

  SELECT id INTO gat_m1  FROM gatilhos_gtt WHERE codigo = 'M1';
  SELECT id INTO gat_m2  FROM gatilhos_gtt WHERE codigo = 'M2';
  SELECT id INTO gat_m3  FROM gatilhos_gtt WHERE codigo = 'M3';
  SELECT id INTO gat_m4  FROM gatilhos_gtt WHERE codigo = 'M4';
  SELECT id INTO gat_m5  FROM gatilhos_gtt WHERE codigo = 'M5';
  SELECT id INTO gat_m6  FROM gatilhos_gtt WHERE codigo = 'M6';
  SELECT id INTO gat_m9  FROM gatilhos_gtt WHERE codigo = 'M9';
  SELECT id INTO gat_m12 FROM gatilhos_gtt WHERE codigo = 'M12';

  SELECT id INTO gat_s1  FROM gatilhos_gtt WHERE codigo = 'S1';
  SELECT id INTO gat_s3  FROM gatilhos_gtt WHERE codigo = 'S3';
  SELECT id INTO gat_s4  FROM gatilhos_gtt WHERE codigo = 'S4';
  SELECT id INTO gat_s7  FROM gatilhos_gtt WHERE codigo = 'S7';
  SELECT id INTO gat_s10 FROM gatilhos_gtt WHERE codigo = 'S10';
  SELECT id INTO gat_s11 FROM gatilhos_gtt WHERE codigo = 'S11';

  SELECT id INTO gat_i1  FROM gatilhos_gtt WHERE codigo = 'I1';
  SELECT id INTO gat_i2  FROM gatilhos_gtt WHERE codigo = 'I2';
  SELECT id INTO gat_i3  FROM gatilhos_gtt WHERE codigo = 'I3';
  SELECT id INTO gat_i4  FROM gatilhos_gtt WHERE codigo = 'I4';

  SELECT id INTO gat_p2  FROM gatilhos_gtt WHERE codigo = 'P2';
  SELECT id INTO gat_p3  FROM gatilhos_gtt WHERE codigo = 'P3';
  SELECT id INTO gat_p4  FROM gatilhos_gtt WHERE codigo = 'P4';
  SELECT id INTO gat_p6  FROM gatilhos_gtt WHERE codigo = 'P6';
  SELECT id INTO gat_p7  FROM gatilhos_gtt WHERE codigo = 'P7';

  SELECT id INTO gat_e1  FROM gatilhos_gtt WHERE codigo = 'E1';
  SELECT id INTO gat_e2  FROM gatilhos_gtt WHERE codigo = 'E2';

  -- ---------------------------------------------------------------------------
  -- 4. USUÁRIOS: PROFESSORES DO HU-UFS
  -- ---------------------------------------------------------------------------
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Prof. Dr. Roberto Fontes Cruz', 'roberto.cruz@academico.ufs.br', '2018001', 'PROFESSOR', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha, ativo = true
  RETURNING id INTO prof_roberto;

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Profa. Dra. Marina Guimarães Prado', 'marina.prado@academico.ufs.br', '2019002', 'PROFESSOR', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha, ativo = true
  RETURNING id INTO prof_marina;

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Prof. Dr. Fernando Teles Barreto', 'fernando.barreto@academico.ufs.br', '2020003', 'PROFESSOR', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha, ativo = true
  RETURNING id INTO prof_fernando;

  -- ---------------------------------------------------------------------------
  -- 5. USUÁRIOS: CORPO DISCENTE (20 ALUNOS)
  -- ---------------------------------------------------------------------------
  aluno_ids := ARRAY[]::BIGINT[];

  -- Aluno 1
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Lucas Santos Sampaio', 'lucas.sampaio@academico.ufs.br', '2023001', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  -- Aluno 2
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Juliana Sousa Campos', 'juliana.campos@academico.ufs.br', '2023002', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  -- Aluno 3
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Beatriz Lima Costa', 'beatriz.costa@academico.ufs.br', '2023003', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  -- Aluno 4
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Carlos Eduardo Santos', 'carlos.santos@academico.ufs.br', '2023004', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  -- Aluno 5
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Mariana Barros Nogueira', 'mariana.nogueira@academico.ufs.br', '2023005', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  -- Aluno 6
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Gabriel Silva Barbosa', 'gabriel.barbosa@academico.ufs.br', '2023006', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  -- Aluno 7
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Larissa Brito Monteiro', 'larissa.monteiro@academico.ufs.br', '2023007', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  -- Aluno 8
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Felipe Nascimento Cruz', 'felipe.cruz@academico.ufs.br', '2023008', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  -- Aluno 9
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Camila Rocha Ferreira', 'camila.ferreira@academico.ufs.br', '2023009', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  -- Aluno 10
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Rodrigo Marques Alencar', 'rodrigo.alencar@academico.ufs.br', '2023010', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  -- Alunos 11 a 20
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Aline Ventura Rodrigues', 'aline.rodrigues@academico.ufs.br', '2023011', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Caio Rezende Bonfim', 'caio.bonfim@academico.ufs.br', '2023012', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Debora Souza Pinheiro', 'debora.pinheiro@academico.ufs.br', '2023013', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Guilherme Costa Medeiros', 'guilherme.medeiros@academico.ufs.br', '2023014', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Heloisa Vieira Andrade', 'heloisa.andrade@academico.ufs.br', '2023015', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Igor Prado Souza', 'igor.prado@academico.ufs.br', '2023016', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Leticia Tavares Amaral', 'leticia.tavares@academico.ufs.br', '2023017', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Mateus Rodrigues Guimaraes', 'mateus.guimaraes@academico.ufs.br', '2023018', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Priscila Batista Machado', 'priscila.machado@academico.ufs.br', '2023019', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Vinicius Almeida Fonseca', 'vinicius.fonseca@academico.ufs.br', '2023020', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET ativo = true RETURNING id INTO v_aluno_id;
  aluno_ids := array_append(aluno_ids, v_aluno_id);

  -- ---------------------------------------------------------------------------
  -- 6. TURMAS ACADÊMICAS (ESTRITAMENTE 2026.1 E 2026.2)
  -- ---------------------------------------------------------------------------
  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, periodo_letivo, ano_semestre, ativa, criada_em)
  VALUES (prof_roberto, 'MED-0101', '2026.1', '2026.1', true, '2026-01-15 08:00:00-03')
  RETURNING id INTO t_cmed_26_1;

  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, periodo_letivo, ano_semestre, ativa, criada_em)
  VALUES (prof_marina, 'MED-0102', '2026.1', '2026.1', true, '2026-01-20 08:00:00-03')
  RETURNING id INTO t_ccir_26_1;

  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, periodo_letivo, ano_semestre, ativa, criada_em)
  VALUES (prof_fernando, 'MED-0201', '2026.2', '2026.2', true, '2026-06-10 08:00:00-03')
  RETURNING id INTO t_uti_26_2;

  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, periodo_letivo, ano_semestre, ativa, criada_em)
  VALUES (prof_roberto, 'ENF-0301', '2026.2', '2026.2', true, '2026-06-15 08:00:00-03')
  RETURNING id INTO t_qual_26_2;

  -- Matricular alunos nas turmas
  FOR i IN 1..10 LOOP
    INSERT INTO turma_alunos (turma_id, aluno_id, matriculado_em)
    VALUES (t_cmed_26_1, aluno_ids[i], '2026-01-20 08:00:00-03') ON CONFLICT DO NOTHING;

    INSERT INTO turma_alunos (turma_id, aluno_id, matriculado_em)
    VALUES (t_uti_26_2, aluno_ids[i], '2026-06-20 08:00:00-03') ON CONFLICT DO NOTHING;
  END LOOP;

  FOR i IN 11..20 LOOP
    INSERT INTO turma_alunos (turma_id, aluno_id, matriculado_em)
    VALUES (t_ccir_26_1, aluno_ids[i], '2026-01-25 08:00:00-03') ON CONFLICT DO NOTHING;

    INSERT INTO turma_alunos (turma_id, aluno_id, matriculado_em)
    VALUES (t_qual_26_2, aluno_ids[i], '2026-06-25 08:00:00-03') ON CONFLICT DO NOTHING;
  END LOOP;

  -- ---------------------------------------------------------------------------
  -- 7. CENÁRIOS CLÍNICOS E PEDAGÓGICOS
  -- ---------------------------------------------------------------------------
  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem, criado_em)
  VALUES (
    prof_roberto,
    'Polifarmácia, Nefrotoxicidade e Hipoglicemia Severa na Enfermaria Clínica',
    'Paciente idoso polimedicado admitido com pneumonia comunitária. Apresenta interações medicamentosas de risco, hipoglicemia severa associada a hipoglicemiante e insuficiência renal aguda por aminoglicosídeo.',
    '1. Rastrear gatilhos do Módulo Medicação (M4 e M5).\n2. Identificar lesão renal aguda induzida por fármaco.\n3. Classificar o dano nas categorias NCC MERP.\n4. Propor intervenção farmacoterapêutica preventiva.',
    '2026-01-10 10:00:00-03'
  ) RETURNING id INTO cen1;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem, criado_em)
  VALUES (
    prof_marina,
    'Abdome Agudo Cirúrgico com Complicação Hemorrágica e Reintervenção',
    'Paciente jovem submetido a apendicectomia laparoscópica. Desenvolve hemoperitônio maciço nas primeiras 24h, choque hipovolêmico com queda abrupta de Hb > 25% e necessidade de retorno urgente ao centro cirúrgico e transfusão de hemocomponentes.',
    '1. Identificar gatilhos do Módulo Cirúrgico (S1 e S11) e Cuidados (C1 e C6).\n2. Avaliar pertinência de hemotransfusão maciça.\n3. Distinguir complicação cirúrgica intrínseca de falha técnica.\n4. Elaborar plano de melhoria com diagrama de causa e efeito.',
    '2026-01-15 14:00:00-03'
  ) RETURNING id INTO cen2;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem, criado_em)
  VALUES (
    prof_fernando,
    'Choque Séptico, Pneumonia Associada à Ventilação (PAV) e Sedação em UTI',
    'Internamento em CTI por choque séptico de foco pulmonar. Evolução com pneumonia nosocomial associada a ventilação mecânica (> 48h), extubação acidental e reintubação de urgência com hipotensão refratária.',
    '1. Aplicar o Módulo Cuidados Intensivos (I1, I4) e Cuidados (C4).\n2. Diferenciar infecção comunitária de infecção hospitalar nosocomial.\n3. Auditar a adesão ao bundle de prevenção de PAV.\n4. Mapear o ciclo PDCA para extubação segura.',
    '2026-02-01 09:00:00-03'
  ) RETURNING id INTO cen3;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem, criado_em)
  VALUES (
    prof_marina,
    'Parto Distócico com Hemorragia Pós-Parto e Laceração Obstétrica Perinatal',
    'Puérpera primigesta em trabalho de parto prolongado submetida a parto instrumental (fórceps). Apresenta laceração perineal de 3º grau e hemorragia pós-parto imediata com perda volêmica > 1.000 mL tratada com ocitocina em altas doses.',
    '1. Rastrear triggers do Módulo Perinatal (P2, P4, P6, P7).\n2. Avaliar manejo ativo do 3º estágio do parto.\n3. Mensurar gravidade obstétrica segundo NCC MERP (Cat. F).\n4. Estabelecer protocolo institucional de hemorragia puerperal.',
    '2026-03-01 11:00:00-03'
  ) RETURNING id INTO cen4;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem, criado_em)
  VALUES (
    prof_fernando,
    'Deterioração Clínica Aguda por Sepse no Serviço de Urgência e Emergência',
    'Paciente atendido na sala de emergência com síndrome coronariana aguda e sepse urinária. Tempo de permanência no pronto-socorro > 8 horas aguardando leito de enfermaria, com deterioração respiratória e readmissão precoce após alta.',
    '1. Rastrear triggers do Módulo Urgência (E1, E2) e Cuidados (C2, C13).\n2. Reconhecer riscos de superlotação e permanência prolongada no PS.\n3. Classificar o desfecho como evento adverso com intervenção imediata.',
    '2026-04-01 16:00:00-03'
  ) RETURNING id INTO cen5;

  -- ---------------------------------------------------------------------------
  -- 8. PRONTUÁRIOS SIMULADOS (JANEIRO DE 2026 A SETEMBRO DE 2026)
  -- ---------------------------------------------------------------------------
  pront_ids := ARRAY[]::BIGINT[];

  -- === JANEIRO/2026 ===
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1, uh_cmed, 'ATD-2026-0101', 68, '2026-01-04', '2026-01-22', 18,
    'Pneumonia comunitária com IRA induzida por gentamicina e hipoglicemia severa (glicemia 42 mg/dL) com uso de glibenclamida.',
    'Ceftriaxona 2g IV, Gentamicina 240mg IV, Glibenclamida 5mg VO, Enalapril 20mg VO, Omeprazol 20mg.',
    'Ureia 110 mg/dL, Creatinina 3.4 mg/dL (basal 0.9), Glicemia 42 mg/dL, Hb 11.8 g/dL.',
    NULL,
    'D5: Sudorese fria, rebaixamento sensorial, revertido com glicose 50% IV. D8: Oligúria e aumento escórias. Suspenso aminoglicosídeo.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2, uh_ccir, 'ATD-2026-0102', 35, '2026-01-12', '2026-01-26', 14,
    'Apendicite aguda complicada com hemoperitônio no D1 pós-operatório. Queda de Hb de 14 para 7.8 g/dL. Reintervenção cirúrgica e hemotransfusão.',
    'Metronidazol 500mg IV, Ciprofloxacino 400mg IV, Dipirona 1g IV, Tramadol 50mg.',
    'Hb pré-op 14.1 g/dL, Hb D1 pós-op 7.8 g/dL, Plaquetas 210.000, Leucócitos 18.500.',
    'Laparotomia exploradora: identificada hemorragia ativa em coto apendicular. Realizada hemostasia cirúrgica com fio inabsorvível e lavagem.',
    'D1: Hipotensão 80x50 mmHg, taquicardia 124 bpm, palidez cutânea. Conduzido ao CC para reintervenção e transfundido 2 CH.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1, uh_cmed, 'ATD-2026-0103', 74, '2026-01-18', '2026-01-28', 10,
    'Insuficiência cardíaca descompensada. Desenvolveu lesão por pressão estágio II em região sacral durante internamento prolongado no leito.',
    'Furosemida 40mg IV, Carvedilol 12.5mg VO, Espironolactona 25mg VO.',
    'BNP 1.400 pg/mL, Na 136 mEq/L, K 4.2 mEq/L, Creatinina 1.2 mg/dL.',
    NULL,
    'D4: Flictena rompida em sacro com área cruenta de 3x4cm. Ausência de mudança de decúbito regular registrada.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5, uh_sue, 'ATD-2026-0104', 59, '2026-01-22', '2026-01-27', 5,
    'Dor precordial típica, permanência no PS por 9h com desenvolvimento de arritmia supraventricular e necessidade de cardioversão química.',
    'AAS 100mg VO, Clopidogrel 75mg VO, Amiodarona 150mg IV.',
    'Troponina ultrassensível 0.08 ng/mL, ECG com TSV paroxística.',
    NULL,
    'Permanência em maca no corredor do PS por 9 horas antes de leito de observação.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  -- === FEVEREIRO/2026 ===
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3, uh_utia, 'ATD-2026-0201', 63, '2026-02-03', '2026-02-23', 20,
    'Choque séptico de foco pulmonar. Ventilação mecânica invasiva por 12 dias. Desenvolveu PAV por Acinetobacter baumannii no D7 de UTI.',
    'Meropenem 1g 8/8h IV, Colistina 150mg 12/12h IV, Noradrenalina 0.4 mcg/kg/min, Fentanil.',
    'Aspirado traqueal positivo > 10^6 UFC para Acinetobacter baumannii MDR. PCR 220 mg/L.',
    NULL,
    'D7 de VM: Nova febre (38.9°C), secreção purulenta em tubo traqueal, piora da relação PaO2/FiO2.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2, uh_ccir, 'ATD-2026-0202', 48, '2026-02-08', '2026-02-18', 10,
    'Colecistectomia videolaparoscópica. No D2 apresentou icterícia e dor intensa. CPRE identificou clipe cirúrgico ocluindo colédoco.',
    'Ceftriaxona 1g IV, Dipirona 1g IV, Ondansetrona 8mg.',
    'Bilirrubina total 6.8 mg/dL (Direta 5.1), FA 480 U/L, GGT 320 U/L.',
    'Conversão e papilotomia endoscópica via CPRE para reposicionamento e alívio de obstrução biliar iatrogênica.',
    'D2: Icterícia escleral visível, colúria e febre. Encaminhado à endoscopia digestiva de urgência.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4, uh_mat, 'ATD-2026-0203', 29, '2026-02-14', '2026-02-20', 6,
    'Trabalho de parto com expulsivo prolongado. Parto a fórceps Simpson com laceração perineal de 3º grau e hematoma de parede vaginal.',
    'Ocitocina 20 UI em SG 500 mL, Cefazolina 2g IV, Ibuprofeno 600mg VO.',
    'Hb pré-parto 12.5 g/dL, pós-parto 9.1 g/dL, Plaquetas 195.000.',
    'Parto fórceps: tração com laceração perineal envolvendo esfíncter anal externo. Realizada esfincteroplastia com PDS 3-0.',
    'Puerpério imediato com dor perineal intensa e retenção urinária exigindo cateterismo de alívio.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1, uh_cmed, 'ATD-2026-0204', 77, '2026-02-20', '2026-02-28', 8,
    'Acidente vascular encefálico isquêmico. Queda do leito na enfermaria com trauma craniano leve (hematoma subgaleal frontal).',
    'AAS 100mg, Atorvastatina 40mg, Enoxaparina 40mg SC profilática.',
    'TC de crânio: sem sangramento intracraniano agudo. Hematoma de partes moles frontal D.',
    NULL,
    'D3: Paciente tentou levantar desacompanhado à noite; grades do leito estavam abaixadas.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  -- === MARÇO/2026 ===
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1, uh_cmed, 'ATD-2026-0301', 65, '2026-03-02', '2026-03-18', 16,
    'Trombose venosa profunda em membro inferior esquerdo. Uso de heparina não fracionada com anticoagulação excessiva (TTPa > 120s) e hematoma muscular.',
    'Heparina sódica contínua em BI, Tramadol 50mg.',
    'TTPa alargado > 120 segundos (controle 30s), RNI 1.1, Hb 10.2 g/dL.',
    NULL,
    'D4: Dor aguda e aumento de volume em coxa E. Ultrassom confirmou hematoma intramuscular de 8x5cm.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3, uh_utia, 'ATD-2026-0302', 55, '2026-03-08', '2026-03-29', 21,
    'Traumatismo cranioencefálico grave. Extubação não planejada no D6 com hipóxia severa (SpO2 78%) e necessidade de reintubação imediata.',
    'Fentanil, Midazolam, Rocurônio, Cefepima 2g 8/8h.',
    'Gasometria arterial pós-extubação acidental: pH 7.21, PaO2 48 mmHg, PaCO2 58 mmHg.',
    NULL,
    'D6: Paciente agitado durante higiene no leito, tracionou tubo endotraqueal. Reintubado às pressas.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4, uh_mat, 'ATD-2026-0303', 31, '2026-03-15', '2026-03-22', 7,
    'Cesariana por descolamento prematuro de placenta. Hemorragia puerperal grave com perda > 1.500 mL tratada com infusão de 40 UI de ocitocina e ácido tranexâmico.',
    'Ocitocina 40 UI IV contínua, Ácido Tranexâmico 1g IV, Misoprostol 800mcg retal.',
    'Hb pré 11.2, Hb pós-parto 6.9 g/dL, Fibrinogênio 150 mg/dL.',
    'Cesárea de emergência com histerorrafia hemostática tipo B-Lynch por atonia uterina refratária.',
    'Choque hipovolêmico classe III revertido na sala de parto com concentrado de hemácias e plasma.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2, uh_ccir, 'ATD-2026-0304', 52, '2026-03-22', '2026-03-31', 9,
    'Hernioplastia inguinal bilateral. Retenção urinária aguda no pós-operatório pós-bloqueio raquidiano tratada com sondagem vesical traumática e hematúria franca.',
    'Dipirona 1g IV, Cefazolina 1g IV dose única profilática.',
    'EAS com hematúria maciça e piúria. Urocultura positiva para Klebsiella pneumoniae.',
    NULL,
    'D1: Globo vesical doloroso. Tentativa de sondagem com sangramento uretral vigoroso.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  -- === ABRIL/2026 ===
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1, uh_cmed, 'ATD-2026-0401', 71, '2026-04-03', '2026-04-19', 16,
    'Fibrilação atrial crônica em uso de varfarina. RNI = 7.4 com epistaxe profusa e hematúria macroscópica. Necessitou vitamina K1 e plasma fresco.',
    'Varfarina suspensa, Vitamina K1 10mg IV lenta, Omeprazol 40mg IV.',
    'RNI 7.4 (alvo 2.0-3.0), TTPa 44s, Hb 10.0 g/dL.',
    NULL,
    'D2: Sangramento nasal bilateral incontrolável com tamponamento anterior e hematúria.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2, uh_ccir, 'ATD-2026-0402', 43, '2026-04-10', '2026-04-24', 14,
    'Laparotomia por obstrução intestinal. Deiscência de sutura aponeurótica e infecção do sítio cirúrgico profunda com evisceração contida.',
    'Piperacilina/Tazobactam 4.5g 6/6h IV, Dipirona 1g, Tramadol 100mg.',
    'Cultura de ferida operatória: Enterococcus faecalis e E. coli sensíveis.',
    'Reabertura cirúrgica: desbridamento de tecido necrótico e fechamento com tela de polipropileno sob tensão.',
    'D6: Saída de secreção serossanguinolenta em grande volume com deiscência aponeurótica parcial.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3, uh_utia, 'ATD-2026-0403', 60, '2026-04-14', '2026-04-30', 16,
    'Sepse abdominal de foco biliar. Infecção de corrente sanguínea associada a cateter venoso central (IPCS) por Staphylococcus epidermidis.',
    'Vancomicina 1g 12/12h IV, Meropenem 1g 8/8h IV.',
    'Hemocultura pareada positiva para Staphylococcus epidermidis com diferencial de tempo > 2h.',
    NULL,
    'D8 de CVC: Hipertermia (39.2°C) e calafrios após manuseio da linha venosa central. Cateter retirado.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5, uh_sue, 'ATD-2026-0404', 68, '2026-04-21', '2026-04-27', 6,
    'Readmissão no pronto-socorro em menos de 48 horas após alta hospitalar prévia por DPOC exacerbado devido a broncoespasmo refratário.',
    'Fenoterol + Ipratrópio inalatório, Hidrocortisona 100mg IV 8/8h, Oxigenoterapia sob cateter.',
    'Gasometria: Acidose respiratória mista pH 7.28, pCO2 56 mmHg, pO2 62 mmHg.',
    NULL,
    'Alta no dia 19/04; retornou no dia 21/04 ao PS em franca insuficiência respiratória.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  -- === MAIO/2026 ===
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1, uh_cmed, 'ATD-2026-0501', 82, '2026-05-02', '2026-05-20', 18,
    'Insuficiência renal crônica agudizada. Administração inadvertida de contraste iodado para angiotomografia gerando anúria e necessidade de hemodiálise de urgência.',
    'Bicarbonato de sódio 8.4% IV, Furosemida, Hidratação salina vigorosa.',
    'Creatinina basal 1.8 subiu para 6.2 mg/dL em 48h pós-contraste. Ureia 190 mg/dL.',
    NULL,
    'D2 pós-TC com contraste: Edema agudo de pulmão e oligúria refratária. Instalado cateter duplo lúmen e iniciada hemodiálise.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2, uh_ccir, 'ATD-2026-0502', 38, '2026-05-09', '2026-05-19', 10,
    'Tireoidectomia total por bócio multinodular. No pós-operatório imediato evoluiu com hematoma cervical compressivo, asfixia aguda e reintubação na URPA.',
    'Dexametasona 4mg IV, Oxigênio sob máscara com reservatório.',
    'Laringoscopia: Edema glótico e desvio traqueal extrínseco por hematoma.',
    'Reabertura cirúrgica de urgência à beira do leito na URPA para drenagem de hematoma compressivo.',
    'Imediatamente após extubação: estridor respiratório e abaulamento cervical progressivo.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4, uh_mat, 'ATD-2026-0503', 27, '2026-05-15', '2026-05-21', 6,
    'Parto cesáreo com atonia uterina pós-parto e uso inadvertido de dose excessiva de ocitocina com hipotensão e náuseas intensas.',
    'Ocitocina 30 UI em infusão rápida, Ondansetrona 8mg IV.',
    'Hb pré 12.0, Hb pós 9.8 g/dL.',
    NULL,
    'Durante a infusão rápida de ocitocina: queda súbita da PA de 120x80 para 70x40 mmHg com náuseas incoercíveis.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3, uh_utia, 'ATD-2026-0504', 58, '2026-05-22', '2026-06-03', 12,
    'Politrauma com contusão pulmonar. Readmissão precoce em UTI 24 horas após transferência para enfermaria por dessaturação e broncoaspiração.',
    'Ceftriaxona 2g IV, Clindamicina 600mg IV.',
    'Rx de tórax: novo infiltrado alveolar em base D compatível com broncoaspiração.',
    NULL,
    'Transferido da UTI no dia 28/05; broncoaspirou dieta enteral na enfermaria e retornou entubado para a UTI em 29/05.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  -- === JUNHO/2026 ===
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1, uh_cmed, 'ATD-2026-0601', 66, '2026-06-01', '2026-06-16', 15,
    'Colite pseudomembranosa por Clostridium difficile após 14 dias de ceftriaxona e ciprofloxacino para infecção urinária.',
    'Vancomicina oral 125mg 6/6h por 10 dias, Hidratação venosa isotônica.',
    'Toxina A e B para C. difficile positiva em fezes diarreicas.',
    NULL,
    'D8 de internamento: diarreia aquosa profusa (> 8 dejeções/dia) e dor abdominal cólica intensa.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2, uh_ccir, 'ATD-2026-0602', 49, '2026-06-08', '2026-06-22', 14,
    'Artroplastia total de quadril esquerdo. Desenvolveu Trombose Venosa Profunda (TVP) confirmada por eco-Doppler no D5 de pós-operatório.',
    'Enoxaparina 1mg/kg 12/12h SC terapêutica, Dipirona 1g.',
    'Eco-Doppler venoso: trombose oclusiva em veia femoral comum e femoral superficial E.',
    NULL,
    'D5: Edema assimétrico em membro inferior esquerdo com empastamento de panturrilha e dor ao dorsoflexão (sinal de Homans positivo).')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3, uh_utia, 'ATD-2026-0603', 70, '2026-06-14', '2026-07-02', 18,
    'Pós-operatório de revascularização miocárdica. Ventilação mecânica prolongada (> 48 horas) e elevação de troponina I > 2.5 ng/mL sugerindo infarto perioperatório.',
    'Nitroglicerina IV, Dobutamina, AAS 100mg, Heparina profilática.',
    'Troponina I sérica pós-op: 3.8 ng/mL (valor de referência < 0.04 ng/mL). ECG com supra de ST em DII, DIII e aVF.',
    NULL,
    'Instabilidade hemodinâmica na primeira noite de pós-operatório exigindo suporte inotrópico e retardo no desmame ventilatório.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5, uh_sue, 'ATD-2026-0604', 53, '2026-06-20', '2026-06-26', 6,
    'Reação alérgica anafilactóide grave após infusão de dipirona venosa na sala de medicação do pronto-socorro. Necessitou adrenalina intramuscular e anti-histamínico.',
    'Adrenalina 0.5mg IM em vasto lateral da coxa, Difenidramina 50mg IV, Hidrocortisona 500mg IV.',
    'Evolução com estridor, placas urticariformes disseminadas e hipotensão 70x40 mmHg.',
    NULL,
    'Administração sem conferência prévia da etiqueta de alergia a AINEs informada pelo paciente na triagem.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  -- === JULHO/2026 ===
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1, uh_cmed, 'ATD-2026-0701', 75, '2026-07-03', '2026-07-18', 15,
    'Acidente vascular cerebral isquêmico admitido com úlcera por pressão estágio III infectada presente na admissão (adquirida em domicílio pré-internação).',
    'Amoxicilina/Clavulanato 1.2g IV 8/8h, Curativo com hidrogel e alginato de prata.',
    'Hemograma: Leucócitos 14.200 com desvio. Swab da úlcera: Pseudomonas aeruginosa.',
    NULL,
    'Dano presente na admissão (DPA = Sim). Documentado no exame físico de entrada lesão cavitária sacral com necrose tecidual.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2, uh_ccir, 'ATD-2026-0702', 56, '2026-07-10', '2026-07-25', 15,
    'Colectomia parcial por neoplasia de cólon. Lesão iatrogênica acidental de ureter esquerdo identificada no D2 por fístula urinária em dreno abdominal.',
    'Meropenem 1g IV, Hidratação, Analgesia com morfina IV.',
    'Dosagem de ureia e creatinina no líquido do dreno: Creatinina 45 mg/dL (compatível com urina).',
    'Reintervenção: Ureteroplastia com reimplante ureterovesical e inserção de cateter duplo J.',
    'D2: Débito aumentado em dreno tubular de aspecto citrino em grande volume.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3, uh_utia, 'ATD-2026-0703', 62, '2026-07-16', '2026-07-31', 15,
    'Insuficiência respiratória aguda por pneumonia viral. Sedação excessiva com midazolam/fentanil gerando hipotensão grave e necessidade de infusão de flumazenil e noradrenalina.',
    'Flumazenil 0.2mg IV, Noradrenalina, Fisioterapia motora intensiva.',
    'Escala RASS -5 persistente sem resposta a estímulos após 24h de suspensão da sedação.',
    NULL,
    'D7 de UTI: Coma medicamentoso prolongado decorrente de acúmulo de metabólitos em disfunção renal.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4, uh_mat, 'ATD-2026-0704', 24, '2026-07-22', '2026-07-27', 5,
    'Trabalho de parto pré-termo. Tocolise com sulfato de magnésio com toxicidade e abolição de reflexos patelares, revertida com gluconato de cálcio 10%.',
    'Gluconato de cálcio 10% 1g IV lento, Suspensão de sulfato de magnésio.',
    'Magnésio sérico: 8.9 mg/dL (nível terapêutico 4.8 - 8.4 mg/dL). Frequência respiratória 10 ipm.',
    NULL,
    'Fase de manutenção da infusão de MgSO4: paciente referiu fraqueza muscular generalizada e hiporreflexia.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  -- === AGOSTO/2026 ===
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1, uh_cmed, 'ATD-2026-0801', 69, '2026-08-02', '2026-08-17', 15,
    'Insuficiência hepática crônica. Hipotensão grave e sedação excessiva por superdosagem inadvertida de morfina prescrita sem ajuste renal/hepático.',
    'Naloxona 0.4mg IV repetida, Oxigenoterapia.',
    'Gasometria: pH 7.26, pCO2 62 mmHg com bradifluxo respiratório (FR 8 ipm).',
    NULL,
    'D2: Pupilas puntiformes, sonolência profunda e depressão respiratória aguda após 2ª dose de morfina.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2, uh_ccir, 'ATD-2026-0802', 45, '2026-08-09', '2026-08-20', 11,
    'Gastrectomia parcial. Suspeita intraoperatória de compressa cirúrgica retida após contagem incorreta, exigindo raio-X intraoperatório no bloco cirúrgico.',
    'Cefazolina 2g IV, Analgésicos.',
    'Raio-X de abdome no bloco operatório: confirmada imagem radiopaca compatível com filamento de compressa em hipocôndrio E.',
    'Reabertura da cavidade abdominal antes do fechamento definitivo para resgate da compressa retida.',
    'Pausa operatória de 45 minutos no centro cirúrgico com paciente sob anestesia geral.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3, uh_utia, 'ATD-2026-0803', 73, '2026-08-14', '2026-08-30', 16,
    'Septicemia grave com necessidade de inserção de cateter venoso central subclavicular com pneumotórax iatrogênico à direita exigindo drenagem torácica sob selo d''água.',
    'Drenagem de tórax fechada em 5º espaço intercostal, Antibioticoterapia.',
    'Rx de tórax pós-punção de subclávia: colapso pulmonar à D de 40% com desvio de mediastino.',
    NULL,
    'Imediatamente após a punção: taquipneia súbita, enfisema subcutâneo supraclavicular e dor torácica aguda.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5, uh_sue, 'ATD-2026-0804', 61, '2026-08-21', '2026-08-28', 7,
    'Cetoacidose diabética na sala vermelha do pronto-socorro. Hipocalemia severa iatrogênica (K = 2.4 mEq/L) durante insulinoterapia venosa sem reposição concomitante de potássio.',
    'Cloreto de potássio 19.1% IV em bomba de infusão, Ajuste na escala de insulina regular.',
    'Potássio sérico: 2.4 mEq/L, ECG com onda U proeminente e achatamento de onda T.',
    NULL,
    'Paciente apresentou taquicardia ventricular não sustentada detectada no monitor multiparamétrico.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  -- === SETEMBRO/2026 (MÊS ATUAL) ===
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1, uh_cmed, 'ATD-2026-0901', 78, '2026-09-01', '2026-09-10', 9,
    'Pneumonia nosocomial por broncoaspiração em enfermaria clínica com queda acentuada de hemoglobina em uso de anticoagulante oral direto (Rivaroxabana).',
    'Ceftriaxona 2g IV + Claritromicina 500mg IV, Suspensão de rivaroxabana.',
    'Hb admissão 13.0 subiu para queda no D5 de 8.2 g/dL (queda de 37%), Sangramento em fezes.',
    NULL,
    'D5: Melena confirmada no toque retal com desidratação e necessidade de expansão volêmica e 2 CH.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2, uh_ccir, 'ATD-2026-0902', 50, '2026-09-02', '2026-09-11', 9,
    'Prostatectomia radical. Retorno não planejado à sala operatória no pós-operatório imediato por sangramento de loja prostática com formação de coágulos e retenção.',
    'Irrigação contínua com SF 0.9%, Ácido Tranexâmico 1g IV.',
    'Hb pré 14.5, Hb pós 9.0 g/dL. Coagulograma normal.',
    'Cistoscopia e fulguração cirúrgica de vaso sangrante em colo vesical sob raquianestesia.',
    'D1: Tamponamento vesical com saída de coágulos abundantes na sonda de Foley.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3, uh_utia, 'ATD-2026-0903', 64, '2026-09-03', '2026-09-12', 9,
    'Pós-PCR revertida. Desenvolveu lesão renal aguda KDIGO 3 por vancomicina associada a piperacilina/tazobactam com necessidade de hemodiálise venovenosa contínua.',
    'Vancomicina suspensa, Linezolida 600mg 12/12h IV, Terapia de substituição renal contínua.',
    'Creatinina 4.9 mg/dL (basal 1.0), Vancomicinemia de vale 38 mcg/mL (alvo 15-20 mcg/mL).',
    NULL,
    'D6: Níveis séricos de vancomicina muito elevados por dosagem inadequada sem ajuste de depuração.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5, uh_sue, 'ATD-2026-0904', 58, '2026-09-04', '2026-09-11', 7,
    'Síndrome febril indeterminada. Infusão de ceftriaxona com choque distributivo alérgico e parada cardiorrespiratória em atividade elétrica sem pulso no pronto-socorro.',
    'Adrenalina 1mg IV em bólus repetida a cada 3 minutos, Massagem cardíaca por 8 minutos, IOT imediata.',
    'Lactato 4.8 mmol/L, Gasometria: acidose metabólica grave pH 7.12.',
    NULL,
    'D1: PCR revertida em 8 minutos de suporte avançado de vida. Transferido de emergência para a UTI-A.')
  RETURNING id INTO p_id; pront_ids := array_append(pront_ids, p_id);

  -- ---------------------------------------------------------------------------
  -- 9. ATIVIDADES DE AUDITORIA VINCULADAS
  -- ---------------------------------------------------------------------------
  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (
    t_cmed_26_1, cen1,
    'Auditoria Retrospectiva GTT: Segurança Farmacoterapêutica em Clínica Médica',
    '2026-02-01 08:00:00-03', '2026-04-30 23:59:59-03', 30, true
  ) RETURNING id INTO atv1;

  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (
    t_ccir_26_1, cen2,
    'Auditoria Retrospectiva GTT: Prevenção de Complicações Perioperatórias',
    '2026-03-01 08:00:00-03', '2026-05-31 23:59:59-03', 30, true
  ) RETURNING id INTO atv2;

  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (
    t_uti_26_2, cen3,
    'Auditoria Retrospectiva GTT: Monitoramento de Eventos em Cuidados Intensivos',
    '2026-07-01 08:00:00-03', '2026-09-30 23:59:59-03', 30, false
  ) RETURNING id INTO atv3;

  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (
    t_qual_26_2, cen5,
    'Auditoria Retrospectiva GTT: Rastreamento Global e Indicadores de Urgência',
    '2026-08-01 08:00:00-03', '2026-10-31 23:59:59-03', 30, false
  ) RETURNING id INTO atv4;

  -- ---------------------------------------------------------------------------
  -- 10. REVISÕES INDIVIDUAIS (AUDITORIAS DOS ALUNOS), ACHADOS, AVALIAÇÕES E NOTAS
  -- ---------------------------------------------------------------------------

  -- Revisão 1: Aluno Lucas Sampaio auditando ATD-2026-0101 (Medicação M4, M5 - Confirmou Dano Cat. E)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv1, aluno_ids[1], pront_ids[1], 1140, true, '2026-02-15 14:30:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_m4, cat_ram, true, 'Hipoglicemia sintomática de 42 mg/dL por sulfonilureia revertida com glicose hipertônica venosa.', false, 'CATEGORIA_E');

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_m5, cat_ram, true, 'Elevação de creatinina > 2x valor basal induzida por gentamicina sem monitoramento sérico.', false, 'CATEGORIA_F');

  -- Validação Docente com Nota 9.50 e parecer formativo
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_roberto, 'Excelente identificação dos gatilhos M4 e M5. Análise de nexo causal e classificação nas categorias E e F perfeitamente adequadas ao manual do IHI.', 9.50, true, '2026-02-18 10:15:00-03');

  -- Ishikawa, 5W3H e Ciclo PDCA
  INSERT INTO analises_ishikawa (revisao_individual_id, efeito_principal, metodo, mao_de_obra, material, medida, meio_ambiente, maquina)
  VALUES (v_rev_id, 'Lesão Renal Aguda e Hipoglicemia Medicamentosa', 'Ausência de protocolo de ajuste renal', 'Sobrecarga de trabalho na prescrição', 'Falta de alerta eletrônico no prontuário', 'Monitoramento laboratorial espaçado', 'Enfermaria com alta rotatividade', 'Computadores lentos para checagem');

  INSERT INTO planos_acao_5w3h (revisao_individual_id, o_que, por_que, quem, onde, quando, como, quanto_custa, como_medir)
  VALUES (v_rev_id, 'Implantar alerta eletrônico de nefrotoxicidade', 'Reduzir IRA medicamentosa em 80%', 'Comissão de Farmácia e T.I.', 'Prescrição Eletrônica HU-UFS', 'Março/2026', 'Bloqueio de aminoglicosídeo sem creatinina prévia', 0.00, 'Taxa de ocorrência do trigger M5');

  INSERT INTO ciclos_pdca (revisao_individual_id, planejar, fazer, checar, agir)
  VALUES (v_rev_id, 'Planejar protocolo de alerta eletrônico na prescrição de vancomicina e aminoglicosídeos', 'Executar piloto na enfermaria de Clínica Médica com apoio da Farmácia Clínica', 'Monitorar taxa de ocorrência de elevação da creatinina > 2x e gatilho M5 mensalmente', 'Padronizar protocolo em todo o hospital universitário e atualizar formulário terapêutico');


  -- Revisão 2: Aluna Juliana Campos auditando ATD-2026-0102 (Cirúrgico S1, C1, C6 - Cat. F)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv2, aluno_ids[2], pront_ids[2], 980, true, '2026-03-05 16:45:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_s1, cat_cirurg, true, 'Reintervenção cirúrgica de urgência nas primeiras 24h por hemoperitônio maciço.', false, 'CATEGORIA_F');

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_c1, cat_cirurg, true, 'Transfusão de 2 unidades de concentrado de hemácias por choque hipovolêmico pós-operatório.', false, 'CATEGORIA_F');

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_c6, cat_cirurg, true, 'Queda do valor de hemoglobina superior a 40% em menos de 12 horas.', false, 'CATEGORIA_E');

  -- Validação Docente com Nota 10.00
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_marina, 'Desempenho impecável. Demonstrou domínio da associação entre gatilhos de cuidados e módulo cirúrgico, fundamentando com rigor técnico.', 10.00, true, '2026-03-08 14:20:00-03');

  INSERT INTO analises_ishikawa (revisao_individual_id, efeito_principal, metodo, mao_de_obra, material, medida, meio_ambiente, maquina)
  VALUES (v_rev_id, 'Hemorragia intra-abdominal pós-operatória com reintervenção', 'Checklist de cirurgia segura incompleto na etapa Sign-out', 'Equipe cirúrgica sob pressão de horário', 'Fios cirúrgicos de lote com falha de tração', 'Monitoramento hemodinâmico tardio na RPA', 'Sala cirúrgica com iluminação deficiente', 'Eletrocautério com calibragem defasada');

  INSERT INTO planos_acao_5w3h (revisao_individual_id, o_que, por_que, quem, onde, quando, como, quanto_custa, como_medir)
  VALUES (v_rev_id, 'Auditoria diária de 100% dos checklists cirúrgicos', 'Garantir hemostasia rigorosa antes do fechamento', 'Núcleo de Segurança do Paciente', 'Centro Cirúrgico HU-UFS', 'Abril/2026', 'Acompanhamento presencial no sign-out', 0.00, 'Taxa de conformidade do checklist');

  INSERT INTO ciclos_pdca (revisao_individual_id, planejar, fazer, checar, agir)
  VALUES (v_rev_id, 'Planejar revisão das rotinas de hemostasia e checklist cirúrgico', 'Executar treinamento de toda a equipe do Centro Cirúrgico', 'Checar adesão ao checklist através de auditorias semanais', 'Padronizar a checagem obrigatória da cavidade antes da síntese parietal');


  -- Revisão 3: Aluna Beatriz Costa auditando ATD-2026-0103 (Cuidados C8 - Cat. E)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv1, aluno_ids[3], pront_ids[3], 850, true, '2026-02-22 11:10:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_c8, cat_quedas, true, 'Desenvolvimento de lesão por pressão estágio II em região sacral durante a internação por falha de mudança de decúbito.', false, 'CATEGORIA_E');

  -- Validação Docente com Nota 8.50
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_roberto, 'Boa identificação da lesão por pressão como evento adverso intrahospitalar evitável. Sentiu falta de explorar o nexo temporal da admissão.', 8.50, true, '2026-02-25 09:30:00-03');

  INSERT INTO analises_ishikawa (revisao_individual_id, efeito_principal, metodo, mao_de_obra, material, medida, meio_ambiente, maquina)
  VALUES (v_rev_id, 'Lesão por pressão estágio II adquirida em internação', 'Rotina de mudança de decúbito irregular', 'Equipe de enfermagem reduzida no plantão noturno', 'Colchões piramidais desgastados', 'Escala de Braden não reavaliada a cada 48h', 'Leitos com grades rígidas sem proteção', 'Ausência de relógio de mudança de decúbito no leito');

  INSERT INTO planos_acao_5w3h (revisao_individual_id, o_que, por_que, quem, onde, quando, como, quanto_custa, como_medir)
  VALUES (v_rev_id, 'Substituir colchões por pneumáticos e implantar relógio de decúbito', 'Prevenir novas lesões em pacientes de alto risco', 'Comissão de Pele e Direção Administrativa', 'Enfermarias de Clínica Médica', 'Março/2026', 'Aquisição de 20 colchões pneumáticos', 8500.00, 'Incidência de LPP por 1.000 pacientes-dia');

  INSERT INTO ciclos_pdca (revisao_individual_id, planejar, fazer, checar, agir)
  VALUES (v_rev_id, 'Planejar protocolo institucional de prevenção de lesões por pressão', 'Distribuir relógios de decúbito e treinar técnicos de enfermagem', 'Checar pontuação de Braden e inspecionar integridade cutânea diariamente', 'Instituir selo de leito seguro e padronizar rotina no manual assistencial');


  -- Revisão 4: Aluno Carlos Santos auditando ATD-2026-0201 (CTI I1, C4 - PAV em UTI Cat. F)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv3, aluno_ids[4], pront_ids[5], 1220, true, '2026-07-10 15:00:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_i1, cat_iras, true, 'Pneumonia associada à ventilação mecânica diagnosticada no D7 de VM na UTI por A. baumannii.', false, 'CATEGORIA_F');

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_c4, cat_iras, false, 'Hemocultura realizada sem crescimento de patógeno (gatilho positivo porém sem confirmação de bacteremia).', false, NULL);

  -- Validação Docente com Nota 9.00
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_fernando, 'Muito bom raciocínio clínico ao registrar o trigger de hemocultura como negativo para dano e o I1 como positivo. Demonstra rigor estatístico.', 9.00, true, '2026-07-14 11:00:00-03');

  INSERT INTO analises_ishikawa (revisao_individual_id, efeito_principal, metodo, mao_de_obra, material, medida, meio_ambiente, maquina)
  VALUES (v_rev_id, 'Pneumonia associada à ventilação mecânica (PAV) em UTI', 'Higiene oral com clorexidina 0,12% fora do aprazamento', 'Alta demanda de pacientes críticos por enfermeiro', 'Filtros de circuito ventilatório sem troca no prazo', 'Pressão de cuff não mensurada a cada 6h', 'Unidade de Terapia Intensiva com alto índice de colonização', 'Ventiladores mecânicos sem aspiração subglótica contínua');

  INSERT INTO planos_acao_5w3h (revisao_individual_id, o_que, por_que, quem, onde, quando, como, quanto_custa, como_medir)
  VALUES (v_rev_id, 'Implantar bundle de prevenção de PAV com checagem eletrônica', 'Reduzir taxa de PAV em 50% na UTI geral', 'CCIH e Coordenação Médica da UTI', 'UTI Geral HU-UFS', 'Agosto/2026', 'Auditoria à beira-leito dos 5 itens do bundle', 1200.00, 'Densidade de incidência de PAV por 1.000 dias de VM');

  INSERT INTO ciclos_pdca (revisao_individual_id, planejar, fazer, checar, agir)
  VALUES (v_rev_id, 'Planejar protocolo de bundle de ventilação mecânica da AMIB/IHI', 'Capacitar médicos, fisioterapeutas e enfermeiros da UTI', 'Checar adesão diária à cabeceira elevada 30-45° e pressão do cuff', 'Padronizar a checagem em prontuário eletrônico como barreira assistencial');


  -- Revisão 5: Aluna Mariana Nogueira auditando ATD-2026-0202 (Cirúrgico S1, S10, S11 - Cat. F)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv2, aluno_ids[5], pront_ids[6], 1050, true, '2026-03-12 18:20:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_s11, cat_cirurg, true, 'Iatrogenia de via biliar com clipe cirúrgico ocluindo colédoco e icterícia obstrutiva.', false, 'CATEGORIA_F');

  -- Validação Docente com Nota 8.00
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_marina, 'Auditou com precisão a complicação cirúrgica. Lembre-se que reintervenções endoscópicas (CPRE) também enquadram o trigger S1.', 8.00, true, '2026-03-16 16:30:00-03');


  -- Revisão 6: Aluno Gabriel Barbosa auditando ATD-2026-0301 (Medicação M2, M3 - TTPa > 120s e Hematoma Cat. E)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv1, aluno_ids[6], pront_ids[9], 890, true, '2026-03-25 09:40:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_m2, cat_ram, true, 'Superanticoagulação por heparina não fracionada com TTPa > 120s e sangramento intramuscular.', false, 'CATEGORIA_E');

  -- Validação Docente com Nota 7.50
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_roberto, 'Identificou o dano por heparina. Faltou detalhar a necessidade de suspensão abrupta (M12) que também constava no sumário.', 7.50, true, '2026-03-28 15:45:00-03');


  -- Revisão 7: Aluna Larissa Monteiro auditando ATD-2026-0302 (CTI I4 - Extubação Não Planejada Cat. H)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv3, aluno_ids[7], pront_ids[10], 1180, true, '2026-07-20 14:15:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_i4, cat_iras, true, 'Extubação acidental seguida de hipóxia crítica (SpO2 78%) exigindo suporte de vida imediato.', false, 'CATEGORIA_H');

  -- Validação Docente com Nota 10.00
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_fernando, 'Parabéns pela perfeita classificação na Categoria H (intervenção de suporte de vida necessária para manter a sobrevida).', 10.00, true, '2026-07-24 17:00:00-03');


  -- Revisão 8: Aluno Felipe Cruz auditando ATD-2026-0401 (Medicação M3, M6 - Varfarina RNI 7.4 e Vit K Cat. E)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv1, aluno_ids[8], pront_ids[13], 940, true, '2026-04-25 11:20:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_m3, cat_ram, true, 'RNI alargado em 7.4 associado a hemorragia nasal e hematúria com uso de varfarina.', false, 'CATEGORIA_E');

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_m6, cat_ram, true, 'Administração de fitomenadiona (Vitamina K) para reversão urgente do efeito anticoagulante.', false, 'CATEGORIA_E');

  -- Validação Docente com Nota 9.00
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_roberto, 'Muito bem estruturada a revisão. Rastreou com competência os triggers relacionados ao manejo de anticoagulantes.', 9.00, true, '2026-04-28 10:00:00-03');


  -- Revisão 9: Aluna Camila Ferreira auditando ATD-2026-0501 (Nefrotoxicidade por Contraste - Hemodiálise Cat. G - Dano Permanente)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv1, aluno_ids[9], pront_ids[17], 1260, true, '2026-05-24 16:10:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_c3, cat_ram, true, 'Necessidade de diálise aguda após nefrotoxicidade por contraste iodado em paciente renal crônico prévio.', false, 'CATEGORIA_G');

  -- Validação Docente com Nota 9.50
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_roberto, 'Excelente raciocínio. A transição para diálise crônica após o episódio agudo justifica plenamente o enquadramento na Categoria G.', 9.50, true, '2026-05-28 14:00:00-03');


  -- Revisão 10: Aluno Rodrigo Alencar auditando ATD-2026-0701 (DANO PRESENTE NA ADMISSÃO - DPA = SIM, Úlcera por Pressão Grau III Cat. E)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv1, aluno_ids[10], pront_ids[25], 880, true, '2026-07-26 10:00:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_c8, cat_quedas, true, 'Úlcera por pressão avançada adquirida no domicílio e comprovadamente presente no momento da admissão hospitalar.', true, 'CATEGORIA_E');

  -- Validação Docente com Nota 10.00
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_roberto, 'Perfeito! Demonstrou pleno entendimento da metodologia IHI: o dano existiu e deve ser computado nas taxas globais, marcando devidamente DPA = Sim.', 10.00, true, '2026-07-29 11:30:00-03');


  -- Revisão 11: Aluna Aline Rodrigues auditando ATD-2026-0702 (Cirúrgico S1, S10 - Lesão Ureteral Cat. F)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv2, aluno_ids[11], pront_ids[26], 1100, true, '2026-07-28 15:30:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_s10, cat_cirurg, true, 'Lesão iatrogênica acidental de ureter esquerdo durante colectomia necessitando reimplante cirúrgico.', false, 'CATEGORIA_F');

  -- Validação Docente com Nota 8.50
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_marina, 'Muito boa fundamentação. O dano exigiu prolongamento da internação com reintervenção.', 8.50, true, '2026-08-01 09:15:00-03');


  -- Revisão 12: Aluno Caio Bonfim auditando ATD-2026-0803 (CTI I3 - Pneumotórax Iatrogênico por CVC Cat. F)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv3, aluno_ids[12], pront_ids[31], 990, true, '2026-08-25 17:00:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_i3, cat_iras, true, 'Complicação procedimental de punção de subclávia com pneumotórax e drenagem torácica.', false, 'CATEGORIA_F');

  -- Validação Docente com Nota 9.00
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_fernando, 'Excelente análise do evento adverso procedimental em ambiente intensivo.', 9.00, true, '2026-08-29 16:00:00-03');


  -- Revisão 13: Aluna Debora Pinheiro auditando ATD-2026-0904 (Urgência E1, E2, C2 - PCR por Anafilaxia Cat. I - Óbito Contribuinte)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv4, aluno_ids[13], pront_ids[36], 1350, true, '2026-09-08 14:00:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_c2, cat_ram, true, 'Parada cardiorrespiratória em atividade elétrica sem pulso desencadeada por choque anafilático grave após dipirona prescrita inadvertidamente.', false, 'CATEGORIA_I');

  -- Validação Docente com Nota 10.00
  INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, nota, homologado, data_validacao)
  VALUES (v_rev_id, prof_fernando, 'Auditoria cirúrgica e rigorosa. Classificação na Categoria I plenamente condizente com as diretrizes do NCC MERP.', 10.00, true, '2026-09-10 11:00:00-03');


  -- ---------------------------------------------------------------------------
  -- 11. SUBMISSÕES PENDENTES DE CORREÇÃO (PARA TESTAR O FLUXO DO PROFESSOR)
  -- ---------------------------------------------------------------------------

  -- Revisão Pendente 1: Aluno Guilherme Medeiros auditando ATD-2026-0901 (Clínica Médica)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv1, aluno_ids[14], pront_ids[33], 1020, true, '2026-09-09 10:30:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_c6, cat_ram, true, 'Queda acentuada de hematócrito/hemoglobina com melena durante uso de anticoagulante oral direto.', false, 'CATEGORIA_E');
  -- (Sem linha em validacoes_docentes -> PENDENTE DE CORREÇÃO PELO PROFESSOR ROBERTO)

  -- Revisão Pendente 2: Aluna Heloisa Andrade auditando ATD-2026-0902 (Cirúrgica)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv2, aluno_ids[15], pront_ids[34], 1150, true, '2026-09-10 15:45:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_s1, cat_cirurg, true, 'Retorno não planejado à sala operatória por sangramento e retenção com coágulos em pós-operatório.', false, 'CATEGORIA_F');
  -- (Sem linha em validacoes_docentes -> PENDENTE DE CORREÇÃO PELA PROFESSORA MARINA)

  -- Revisão Pendente 3: Aluno Igor Prado auditando ATD-2026-0903 (UTI)
  INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
  VALUES (atv3, aluno_ids[16], pront_ids[35], 1280, true, '2026-09-11 11:20:00-03')
  RETURNING id INTO v_rev_id;

  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES (v_rev_id, gat_c3, cat_ram, true, 'Lesão renal aguda exigindo hemodiálise contínua por vancomicinemia supraterapêutica sem monitoramento sérico.', false, 'CATEGORIA_G');
  -- (Sem linha em validacoes_docentes -> PENDENTE DE CORREÇÃO PELO PROFESSOR FERNANDO)

  RAISE NOTICE '✔ [SUCESSO] Simulação HU-UFS de 2026 inserida com perfeição!';
END $$;
