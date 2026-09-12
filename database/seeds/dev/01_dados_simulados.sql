-- =============================================================================
-- SIGEA-GTT: Semente de Desenvolvimento / Homologação HU-UFS (Janeiro a Setembro de 2026)
-- Carga Integral do Módulo Educacional (Turmas, Casos Clínicos, Atividades, Submissões e Notas)
-- Arquivo: database/seeds/dev/01_dados_simulados.sql
-- =============================================================================

DO $$
DECLARE
  v_senha TEXT := '$2a$10$QrlMhf/Wah7PtuldYOCIOevxYBCx1f0pxoKLSJe5fmyiqzIotQ/M6'; -- Sigea@123

  -- Usuários Professores
  prof_roberto BIGINT;
  prof_marina BIGINT;
  prof_fernando BIGINT;
  prof_anawaleska BIGINT;

  -- Usuários Alunos
  aluno_ids BIGINT[] := ARRAY[]::BIGINT[];
  temp_id BIGINT;

  -- Unidades Hospitalares
  uh_cmed BIGINT;
  uh_ccir BIGINT;
  uh_utia BIGINT;
  uh_sue  BIGINT;
  uh_mat  BIGINT;

  -- Categorias de EAs
  cat_ram    BIGINT;
  cat_cirurg BIGINT;
  cat_iras   BIGINT;
  cat_quedas BIGINT;

  -- Gatilhos GTT
  gat_m2 BIGINT; gat_m3 BIGINT; gat_m4 BIGINT; gat_m5 BIGINT; gat_m6 BIGINT; gat_m12 BIGINT;
  gat_c1 BIGINT; gat_c2 BIGINT; gat_c3 BIGINT; gat_c4 BIGINT; gat_c6 BIGINT; gat_c8 BIGINT;
  gat_s1 BIGINT; gat_s10 BIGINT; gat_s11 BIGINT;
  gat_i1 BIGINT; gat_i3 BIGINT; gat_i4 BIGINT;
  gat_e1 BIGINT; gat_e2 BIGINT;

  -- Turmas
  t_cmed_26_1 BIGINT;
  t_ccir_26_1 BIGINT;
  t_uti_26_2  BIGINT;
  t_qual_26_2 BIGINT;

  -- Casos Clínicos
  caso1 BIGINT;
  caso2 BIGINT;
  caso3 BIGINT;
  caso4 BIGINT;
  caso5 BIGINT;

  -- Atividades Educacionais
  atv1 BIGINT;
  atv2 BIGINT;
  atv3 BIGINT;
  atv4 BIGINT;

  -- Submissões
  sub_id BIGINT;
BEGIN
  -- ---------------------------------------------------------------------------
  -- 1. IDENTIFICAR UNIDADES HOSPITALARES
  -- ---------------------------------------------------------------------------
  SELECT id INTO uh_cmed FROM unidades_hospitalares WHERE sigla = 'ENF-CMED' LIMIT 1;
  SELECT id INTO uh_ccir FROM unidades_hospitalares WHERE sigla = 'CC' LIMIT 1;
  SELECT id INTO uh_utia FROM unidades_hospitalares WHERE sigla = 'UTI-A' LIMIT 1;
  SELECT id INTO uh_sue  FROM unidades_hospitalares WHERE sigla = 'PS-ADULTO' LIMIT 1;
  SELECT id INTO uh_mat  FROM unidades_hospitalares WHERE sigla = 'MAT' LIMIT 1;

  -- Fallbacks se necessário
  IF uh_cmed IS NULL THEN uh_cmed := 1; END IF;
  IF uh_ccir IS NULL THEN uh_ccir := 2; END IF;
  IF uh_utia IS NULL THEN uh_utia := 3; END IF;
  IF uh_sue IS NULL THEN uh_sue := 4; END IF;
  IF uh_mat IS NULL THEN uh_mat := 5; END IF;

  -- ---------------------------------------------------------------------------
  -- 2. IDENTIFICAR CATEGORIAS DE EAS
  -- ---------------------------------------------------------------------------
  SELECT id INTO cat_ram FROM categorias_eventos_adversos WHERE nome ILIKE '%Reação Adversa a Medicamento%' LIMIT 1;
  SELECT id INTO cat_cirurg FROM categorias_eventos_adversos WHERE nome ILIKE '%Cirúrgico%' LIMIT 1;
  SELECT id INTO cat_iras FROM categorias_eventos_adversos WHERE nome ILIKE '%Infecção%' LIMIT 1;
  SELECT id INTO cat_quedas FROM categorias_eventos_adversos WHERE nome ILIKE '%Queda%' OR nome ILIKE '%Pressão%' LIMIT 1;

  -- ---------------------------------------------------------------------------
  -- 3. IDENTIFICAR GATILHOS GTT
  -- ---------------------------------------------------------------------------
  SELECT id INTO gat_c1 FROM gatilhos_gtt WHERE codigo = 'C1';
  SELECT id INTO gat_c2 FROM gatilhos_gtt WHERE codigo = 'C2';
  SELECT id INTO gat_c3 FROM gatilhos_gtt WHERE codigo = 'C3';
  SELECT id INTO gat_c4 FROM gatilhos_gtt WHERE codigo = 'C4';
  SELECT id INTO gat_c6 FROM gatilhos_gtt WHERE codigo = 'C6';
  SELECT id INTO gat_c8 FROM gatilhos_gtt WHERE codigo = 'C8';

  SELECT id INTO gat_m2 FROM gatilhos_gtt WHERE codigo = 'M2';
  SELECT id INTO gat_m3 FROM gatilhos_gtt WHERE codigo = 'M3';
  SELECT id INTO gat_m4 FROM gatilhos_gtt WHERE codigo = 'M4';
  SELECT id INTO gat_m5 FROM gatilhos_gtt WHERE codigo = 'M5';
  SELECT id INTO gat_m6 FROM gatilhos_gtt WHERE codigo = 'M6';
  SELECT id INTO gat_m12 FROM gatilhos_gtt WHERE codigo = 'M12';

  SELECT id INTO gat_s1 FROM gatilhos_gtt WHERE codigo = 'S1';
  SELECT id INTO gat_s10 FROM gatilhos_gtt WHERE codigo = 'S10';
  SELECT id INTO gat_s11 FROM gatilhos_gtt WHERE codigo = 'S11';

  SELECT id INTO gat_i1 FROM gatilhos_gtt WHERE codigo = 'I1';
  SELECT id INTO gat_i3 FROM gatilhos_gtt WHERE codigo = 'I3';
  SELECT id INTO gat_i4 FROM gatilhos_gtt WHERE codigo = 'I4';

  SELECT id INTO gat_e1 FROM gatilhos_gtt WHERE codigo = 'E1';
  SELECT id INTO gat_e2 FROM gatilhos_gtt WHERE codigo = 'E2';

  -- ---------------------------------------------------------------------------
  -- 4. USUÁRIOS: PROFESSORES
  -- ---------------------------------------------------------------------------
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Prof. Dr. Roberto Fontes Cruz', 'roberto.cruz@academico.ufs.br', '2018001', 'PROFESSOR', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, ativo = true
  RETURNING id INTO prof_roberto;

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Profa. Dra. Marina Guimarães Prado', 'marina.prado@academico.ufs.br', '2019002', 'PROFESSOR', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, ativo = true
  RETURNING id INTO prof_marina;

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Prof. Dr. Fernando Teles Barreto', 'fernando.barreto@academico.ufs.br', '2020003', 'PROFESSOR', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, ativo = true
  RETURNING id INTO prof_fernando;

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Profa. Dra. Ana Waleska', 'anawaleska@academico.ufs.br', '2017004', 'PROFESSOR', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, ativo = true
  RETURNING id INTO prof_anawaleska;

  -- ---------------------------------------------------------------------------
  -- 5. USUÁRIOS: 20 ALUNOS
  -- ---------------------------------------------------------------------------
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Lucas Santos Sampaio', 'lucas.sampaio@academico.ufs.br', '2023001', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Juliana Sousa Campos', 'juliana.campos@academico.ufs.br', '2023002', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Beatriz Lima Costa', 'beatriz.costa@academico.ufs.br', '2023003', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Carlos Eduardo Santos', 'carlos.santos@academico.ufs.br', '2023004', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Mariana Barros Nogueira', 'mariana.nogueira@academico.ufs.br', '2023005', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Gabriel Silva Barbosa', 'gabriel.barbosa@academico.ufs.br', '2023006', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Larissa Brito Monteiro', 'larissa.monteiro@academico.ufs.br', '2023007', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Felipe Nascimento Cruz', 'felipe.cruz@academico.ufs.br', '2023008', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Camila Rocha Ferreira', 'camila.ferreira@academico.ufs.br', '2023009', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Rodrigo Marques Alencar', 'rodrigo.alencar@academico.ufs.br', '2023010', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Aline Ventura Rodrigues', 'aline.rodrigues@academico.ufs.br', '2023011', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Caio Rezende Bonfim', 'caio.bonfim@academico.ufs.br', '2023012', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Debora Souza Pinheiro', 'debora.pinheiro@academico.ufs.br', '2023013', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Guilherme Costa Medeiros', 'guilherme.medeiros@academico.ufs.br', '2023014', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Heloisa Vieira Andrade', 'heloisa.andrade@academico.ufs.br', '2023015', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Igor Prado Souza', 'igor.prado@academico.ufs.br', '2023016', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Leticia Tavares Amaral', 'leticia.tavares@academico.ufs.br', '2023017', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Mateus Rodrigues Guimarães', 'mateus.guimaraes@academico.ufs.br', '2023018', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Priscila Batista Machado', 'priscila.machado@academico.ufs.br', '2023019', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Vinicius Almeida Fonseca', 'vinicius.fonseca@academico.ufs.br', '2023020', 'ALUNO', v_senha, false, true)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo RETURNING id INTO temp_id;
  aluno_ids := array_append(aluno_ids, temp_id);

  -- ---------------------------------------------------------------------------
  -- 6. TURMAS ACADÊMICAS (2026.1 E 2026.2)
  -- ---------------------------------------------------------------------------
  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, nome_disciplina, periodo_letivo, ano_semestre, ativa, criada_em)
  VALUES (prof_roberto, 'MED-0101', 'Clínica Médica e Farmacoterapia Aplicada', '2026.1', '2026.1', true, '2026-01-15 08:00:00-03')
  RETURNING id INTO t_cmed_26_1;

  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, nome_disciplina, periodo_letivo, ano_semestre, ativa, criada_em)
  VALUES (prof_marina, 'MED-0102', 'Cirurgia Geral e Segurança Perioperatória', '2026.1', '2026.1', true, '2026-01-20 08:00:00-03')
  RETURNING id INTO t_ccir_26_1;

  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, nome_disciplina, periodo_letivo, ano_semestre, ativa, criada_em)
  VALUES (prof_fernando, 'MED-0201', 'Medicina Intensiva e Urgências Clínicas', '2026.2', '2026.2', true, '2026-06-10 08:00:00-03')
  RETURNING id INTO t_uti_26_2;

  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, nome_disciplina, periodo_letivo, ano_semestre, ativa, criada_em)
  VALUES (prof_anawaleska, 'ENF-0301', 'Gerenciamento de Riscos e Segurança do Paciente', '2026.2', '2026.2', true, '2026-06-15 08:00:00-03')
  RETURNING id INTO t_qual_26_2;

  -- Matricular Alunos 1 a 10 nas Turmas MED-0101 e MED-0201
  FOR i IN 1..10 LOOP
    INSERT INTO turma_alunos (turma_id, aluno_id) VALUES (t_cmed_26_1, aluno_ids[i]) ON CONFLICT DO NOTHING;
    INSERT INTO turma_alunos (turma_id, aluno_id) VALUES (t_uti_26_2, aluno_ids[i]) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Matricular Alunos 11 a 20 nas Turmas MED-0102 e ENF-0301
  FOR i IN 11..20 LOOP
    INSERT INTO turma_alunos (turma_id, aluno_id) VALUES (t_ccir_26_1, aluno_ids[i]) ON CONFLICT DO NOTHING;
    INSERT INTO turma_alunos (turma_id, aluno_id) VALUES (t_qual_26_2, aluno_ids[i]) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ---------------------------------------------------------------------------
  -- 7. CASOS CLÍNICOS SIMULADOS (PRONTUÁRIO INTEGRADO)
  -- ---------------------------------------------------------------------------

  -- Caso 1: Clínica Médica - Lesão Renal Aguda por Gentamicina + Hipoglicemia por Sulfonilureia
  INSERT INTO casos_clinicos (
    professor_criador_id, unidade_hospitalar_id, titulo, descricao_caso, objetivos_aprendizagem,
    numero_atendimento, idade_paciente, data_admissao, data_alta, tempo_permanencia_dias,
    sumario_alta, prescricoes_medicas, exames_laboratoriais, relatorio_cirurgico, evolucoes_multiprofissionais, criado_em
  ) VALUES (
    prof_roberto, uh_cmed,
    'Caso 1: Insuficiência Renal Aguda e Hipoglicemia Farmacológica na Enfermaria Clínica',
    'Paciente admitido por pneumonia comunitária, evoluiu com elevação acentuada de escórias renais decorrente do uso de aminoglicosídeo sem ajuste de clearance, associado a episódio de hipoglicemia severa (42 mg/dL) revertida com glicose hipertônica venosa.',
    '1. Rastrear triggers de Medicação (M4, M5).\n2. Identificar dano provocado por fármacos com intervenção (Cat. E) e prolongamento de internação (Cat. F).\n3. Construir Ishikawa 6M focado em barreiras na prescrição e dispensação farmacêutica.\n4. Propor plano 5W3H e Ciclo PDCA para bloqueio eletrônico de nefrotoxicidade.',
    'ATD-2026-0101', 68, '2026-01-04', '2026-01-22', 18,
    'Paciente idoso, 68 anos, internado em enfermaria clínica para tratamento de pneumonia bacteriana. Evoluiu no D5 com rebaixamento do nível de consciência e sudorese profusa por hipoglicemia severa, e no D8 com oligúria e elevação de creatinina sérica > 3x o basal.',
    'Ceftriaxona 2g IV 1x/dia, Gentamicina 240mg IV 1x/dia, Glibenclamida 5mg VO em jejum, Enalapril 20mg VO 12/12h, Omeprazol 20mg VO.',
    'Ureia: 110 mg/dL (basal 34 mg/dL), Creatinina: 3.4 mg/dL (basal 0.9 mg/dL), Glicemia em jejum: 42 mg/dL, Hemoglobina: 11.8 g/dL.',
    NULL,
    'D5 (06:30): Paciente encontrado sonolento, sudoreico e confuso pela enfermagem. HGT: 42 mg/dL. Administradas 4 ampolas de Glicose 50% IV com reversão rápida. D8 (14:00): Débito urinário 300 mL nas últimas 24h. Solicitado parecer da Nefrologia e suspenso aminoglicosídeo.',
    '2026-01-10 09:00:00-03'
  ) RETURNING id INTO caso1;

  -- Caso 2: Cirurgia Geral - Apendicite Complicada com Hemoperitônio e Reintervenção (Centro Cirúrgico)
  INSERT INTO casos_clinicos (
    professor_criador_id, unidade_hospitalar_id, titulo, descricao_caso, objetivos_aprendizagem,
    numero_atendimento, idade_paciente, data_admissao, data_alta, tempo_permanencia_dias,
    sumario_alta, prescricoes_medicas, exames_laboratoriais, relatorio_cirurgico, evolucoes_multiprofissionais, criado_em
  ) VALUES (
    prof_marina, uh_ccir,
    'Caso 2: Choque Hipovolêmico Pós-Operatório com Reintervenção Cirúrgica de Urgência',
    'Paciente jovem submetido a apendicectomia convencional evoluiu no primeiro dia pós-operatório com sangramento intra-abdominal maciço, choque hemorrágico, necessidade de transfusão de hemoderivados e retorno não planejado ao centro cirúrgico.',
    '1. Identificar triggers do Módulo Cirúrgico (S1 - Reintervenção) e Cuidados (C1 - Transfusão, C6 - Queda de Hb).\n2. Classificar o nível de dano na Categoria F (prolongamento de hospitalização com reoperação).\n3. Investigar causas no Ishikawa 6M (falha na contagem e checagem de hemostasia).\n4. Estruturar Matriz 5W3H e Ciclo PDCA para auditoria do checklist de cirurgia segura (Sign-out).',
    'ATD-2026-0102', 35, '2026-01-12', '2026-01-26', 14,
    'Paciente de 35 anos admitido com abdome agudo inflamatório por apendicite supurada. Realizada apendicectomia sem intercorrências descritas no relatório inicial. No D1 pós-op, apresentou hipotensão refratária, palidez cutânea intensa e queda de Hb de 14.1 para 7.8 g/dL.',
    'Metronidazol 500mg IV 8/8h, Ciprofloxacino 400mg IV 12/12h, Dipirona 1g IV 6/6h, Tramadol 50mg IV se dor intensa.',
    'Hb pré-operatória: 14.1 g/dL, Hb D1 pós-op: 7.8 g/dL (queda de 44%), Leucócitos: 18.500/mm³, Plaquetas: 210.000/mm³.',
    'Laparotomia exploradora de urgência: identificada hemorragia ativa volumosa em coto apendicular decorrente de falha de ligadura vascular. Realizada hemostasia cirúrgica definitiva com fio inabsorvível e drenagem cavitária.',
    'D1 (11:20): PA 80x50 mmHg, FC 128 bpm, sudorese e abdome distendido com descompressão dolorosa. Acionado cirurgião de plantão. Solicitadas 2 unidades de CH com urgência e reservada sala cirúrgica.',
    '2026-01-15 10:00:00-03'
  ) RETURNING id INTO caso2;

  -- Caso 3: Terapia Intensiva - Pneumonia Associada à Ventilação Mecânica (PAV) em UTI
  INSERT INTO casos_clinicos (
    professor_criador_id, unidade_hospitalar_id, titulo, descricao_caso, objetivos_aprendizagem,
    numero_atendimento, idade_paciente, data_admissao, data_alta, tempo_permanencia_dias,
    sumario_alta, prescricoes_medicas, exames_laboratoriais, relatorio_cirurgico, evolucoes_multiprofissionais, criado_em
  ) VALUES (
    prof_fernando, uh_utia,
    'Caso 3: Pneumonia Associada à Ventilação Mecânica (PAV) por Acinetobacter baumannii em UTI',
    'Paciente vítima de politraumatismo internado em UTI sob ventilação mecânica invasiva. No 7º dia de prótese ventilatória, desenvolve febre alta, secreção purulenta endotraqueal, piora gasométrica e cultura positiva para patógeno multirresistente.',
    '1. Rastrear triggers de Terapia Intensiva (I1 - Pneumonia nosocomial) e Cuidados (C4, C13).\n2. Classificar o dano como Categoria F do NCC MERP.\n3. Aplicar Ishikawa 6M analisando bundle de ventilação mecânica e aspiração traqueal.\n4. Desenvolver plano 5W3H e Ciclo PDCA para auditoria diária dos 5 componentes do bundle de prevenção de PAV.',
    'ATD-2026-0201', 63, '2026-02-03', '2026-02-23', 20,
    'Paciente em pós-operatório neurológico sob ventilação mecânica por 12 dias. Desenvolveu critérios diagnósticos e laboratoriais de PAV no D7 de internação na UTI, necessitando escalonamento de antibioticoterapia de amplo espectro.',
    'Meropenem 1g IV 8/8h, Colistina 150mg IV 12/12h, Noradrenalina 0.4 mcg/kg/min em bomba contínua, Fentanil 2 mL/h.',
    'Aspirado traqueal quantitativo: positivo > 10^6 UFC/mL para Acinetobacter baumannii resistente a carbapenêmicos. Proteína C Reativa: 220 mg/L.',
    NULL,
    'D7 de VM (08:00): Febre de 38.9°C nas últimas 12 horas. Secreção traqueal amarelada espessa em grande quantidade. Relação PaO2/FiO2 caiu de 320 para 180. Ajustado ventilador mecânico e coletadas culturas.',
    '2026-02-05 14:00:00-03'
  ) RETURNING id INTO caso3;

  -- Caso 4: Cirurgia e Iatrogenia Biliar - Oclusão de Colédoco por Clipe Cirúrgico
  INSERT INTO casos_clinicos (
    professor_criador_id, unidade_hospitalar_id, titulo, descricao_caso, objetivos_aprendizagem,
    numero_atendimento, idade_paciente, data_admissao, data_alta, tempo_permanencia_dias,
    sumario_alta, prescricoes_medicas, exames_laboratoriais, relatorio_cirurgico, evolucoes_multiprofissionais, criado_em
  ) VALUES (
    prof_marina, uh_ccir,
    'Caso 4: Iatrogenia de Via Biliar com Oclusão de Colédoco após Colecistectomia Laparoscópica',
    'Paciente submetida a colecistectomia videolaparoscópica com posicionamento acidental de clipe metálico sobre o ducto colédoco, resultando em colestase obstrutiva severa, icterícia escleral e necessidade de CPRE terapêutica com papilotomia.',
    '1. Identificar triggers Cirúrgicos (S1, S10 - Lesão de órgão, S11 - Complicação cirúrgica).\n2. Classificar o evento adverso na Categoria F.\n3. Elaborar Diagrama de Ishikawa 6M avaliando visão crítica de segurança de Strasberg na colecistectomia.\n4. Propor Matriz 5W3H e Ciclo PDCA para dupla checagem visual intraoperatória da via biliar.',
    'ATD-2026-0202', 48, '2026-02-08', '2026-02-18', 10,
    'Mulher de 48 anos internada eletivamente para colecistectomia videolaparoscópica por colelitíase. No 2º dia pós-operatório apresentou dor intensa em hipocôndrio direito, icterícia franca e colúria.',
    'Ceftriaxona 1g IV 12/12h, Dipirona 1g IV 6/6h, Ondansetrona 8mg IV.',
    'Bilirrubina Total: 6.8 mg/dL (Fração Direta: 5.1 mg/dL), Fosfatase Alcalina: 480 U/L, Gama-GT: 320 U/L.',
    'Colangiopancreatografia Retrógrada Endoscópica (CPRE) terapêutica: demonstrada interrupção abrupta do fluxo biliar no terço médio do colédoco compatível com aposição de clipe cirúrgico. Realizada papilotomia e colocação de prótese biliar plástica.',
    'D2 pós-operatório: Paciente refere náuseas, dor epigástrica e coloração amarelada nas escleras. Urina escura. Solicitada avaliação urgente da Gastroenterologia/Endoscopia.',
    '2026-02-10 11:00:00-03'
  ) RETURNING id INTO caso4;

  -- Caso 5: Urgência e Emergência - Choque Anafilático e Parada Cardiorrespiratória por Dipirona
  INSERT INTO casos_clinicos (
    professor_criador_id, unidade_hospitalar_id, titulo, descricao_caso, objetivos_aprendizagem,
    numero_atendimento, idade_paciente, data_admissao, data_alta, tempo_permanencia_dias,
    sumario_alta, prescricoes_medicas, exames_laboratoriais, relatorio_cirurgico, evolucoes_multiprofissionais, criado_em
  ) VALUES (
    prof_anawaleska, uh_sue,
    'Caso 5: Choque Anafilático Grave e Parada Cardiorrespiratória por Alergia Medicamentosa no Pronto-Socorro',
    'Paciente atendido na sala de emergência com síndrome febril e dor muscular. Prescrita e infundida dipirona venosa apesar de registro de alergia prévia na triagem, evoluindo com broncoespasmo severo, colapso circulatório e PCR em AESP revertida com suporte avançado.',
    '1. Rastrear triggers de Cuidados (C2 - Parada cardiorrespiratória) e Medicação (M7, M12).\n2. Classificar o evento adverso como Categoria H (intervenção necessária para sustentar a vida em < 1h).\n3. Investigar no Ishikawa 6M a ausência de pulseira de identificação de alergia e falhas na conferência à beira-leito.\n4. Desenvolver Matriz 5W3H e Ciclo PDCA para implantação da pulseira vermelha de alergia e barreira de dupla checagem.',
    'ATD-2026-0904', 58, '2026-09-04', '2026-09-11', 7,
    'Homem de 58 anos atendido no pronto-socorro geral. Durante infusão de analgésico intravenoso, apresentou edema de glote, cianose labial, colapso hemodinâmico e PCR em atividade elétrica sem pulso (AESP). Reanimado com sucesso por 8 minutos e transferido para a UTI.',
    'Adrenalina 1mg IV em bólus repetida a cada 3 min durante PCR, Hidrocortisona 500mg IV, Prometazina 50mg IM, Solução Fisiológica 0.9% 1.000 mL rápida.',
    'Lactato sérico: 4.8 mmol/L, Gasometria arterial pós-PCR: pH 7.12, PaO2 65 mmHg, PaCO2 56 mmHg, Bicarbonato 16 mEq/L.',
    NULL,
    'D1 (15:10): Paciente iniciou tosse seca, estridor laríngeo e hipotensão inaudível 5 minutos após o término do soro com dipirona. Não portava pulseira de identificação de alergia. Iniciado protocolo de anafilaxia e RCP por 8 minutos.',
    '2026-09-05 08:30:00-03'
  ) RETURNING id INTO caso5;

  -- ---------------------------------------------------------------------------
  -- 8. ATIVIDADES PEDAGÓGICAS
  -- ---------------------------------------------------------------------------
  INSERT INTO atividades_educacionais (
    turma_id, caso_clinico_id, titulo, orientacoes_pedagogicas, data_inicio, data_fim, tempo_limite_minutos, ativa, criada_em
  ) VALUES (
    t_cmed_26_1, caso1,
    'Atividade 1: Investigação GTT em Clínica Médica & Farmacoterapia Segura',
    'Realize a análise retrospectiva do prontuário ATD-2026-0101 buscando rastrear os gatilhos pertinentes do IHI GTT. Em seguida, investigue a causa-raiz no Ishikawa 6M, trace o plano de ação 5W3H e desenhe o Ciclo PDCA.',
    '2026-02-01 08:00:00-03', '2026-04-30 23:59:59-03', 20, true, '2026-01-28 10:00:00-03'
  ) RETURNING id INTO atv1;

  INSERT INTO atividades_educacionais (
    turma_id, caso_clinico_id, titulo, orientacoes_pedagogicas, data_inicio, data_fim, tempo_limite_minutos, ativa, criada_em
  ) VALUES (
    t_ccir_26_1, caso2,
    'Atividade 2: Investigação GTT em Cirurgia Geral & Hemovigilância Perioperatória',
    'Analise o caso cirúrgico ATD-2026-0102. Identifique os gatilhos dos módulos Cirúrgico e Cuidados, aponte a gravidade NCC MERP e estruture o plano de ação para evitar reintervenções cirúrgicas.',
    '2026-03-01 08:00:00-03', '2026-05-31 23:59:59-03', 20, true, '2026-02-25 14:00:00-03'
  ) RETURNING id INTO atv2;

  INSERT INTO atividades_educacionais (
    turma_id, caso_clinico_id, titulo, orientacoes_pedagogicas, data_inicio, data_fim, tempo_limite_minutos, ativa, criada_em
  ) VALUES (
    t_uti_26_2, caso3,
    'Atividade 3: Investigação GTT em Terapia Intensiva & Prevenção de PAV',
    'Efetue a auditoria do prontuário ATD-2026-0201 do paciente crítico. Rastreie os triggers nosológicos e farmacológicos, proponha causas-raiz no diagrama de espinha de peixe e elabore o plano de ação e PDCA para o bundle de VM.',
    '2026-07-01 08:00:00-03', '2026-09-30 23:59:59-03', 20, true, '2026-06-25 16:00:00-03'
  ) RETURNING id INTO atv3;

  INSERT INTO atividades_educacionais (
    turma_id, caso_clinico_id, titulo, orientacoes_pedagogicas, data_inicio, data_fim, tempo_limite_minutos, ativa, criada_em
  ) VALUES (
    t_qual_26_2, caso5,
    'Atividade 4: Investigação GTT em Urgência & Barreiras de Segurança Medicamentosa',
    'Audite o prontuário de choque anafilático ATD-2026-0904. Analise a correlação entre gatilhos de urgência e cuidados, a falha das barreiras assistenciais e desenhe as medidas definitivas no ciclo de melhoria contínua.',
    '2026-08-01 08:00:00-03', '2026-10-31 23:59:59-03', 20, true, '2026-07-28 09:30:00-03'
  ) RETURNING id INTO atv4;

  -- ---------------------------------------------------------------------------
  -- 9. SUBMISSÕES AVALIADAS COM NOTAS E FEEDBACK PEDAGÓGICO
  -- ---------------------------------------------------------------------------

  -- Submissão 1: Aluno Lucas Sampaio na Atividade 1 (Nota 9.50 pelo Prof. Roberto)
  INSERT INTO submissoes_atividades (
    atividade_id, aluno_id, status, tempo_gasto_segundos, data_inicio, data_submissao,
    professor_corretor_id, nota, parecer_docente, data_avaliacao
  ) VALUES (
    atv1, aluno_ids[1], 'AVALIADA', 1140, '2026-02-15 14:00:00-03', '2026-02-15 14:19:00-03',
    prof_roberto, 9.50,
    'Excelente identificação dos gatilhos M4 e M5. A análise de nexo causal e a classificação nas categorias E e F seguiram perfeitamente as diretrizes do IHI GTT. O plano de ação com foco no bloqueio eletrônico de prescrição foi muito bem fundamentado.',
    '2026-02-18 10:15:00-03'
  ) RETURNING id INTO sub_id;

  INSERT INTO submissao_gatilhos (submissao_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES
    (sub_id, gat_m4, cat_ram, true, 'Hipoglicemia sintomática de 42 mg/dL por sulfonilureia revertida com glicose hipertônica venosa.', false, 'CATEGORIA_E'),
    (sub_id, gat_m5, cat_ram, true, 'Elevação de creatinina sérica > 3x o valor basal induzida por gentamicina sem monitoramento sérico prévio.', false, 'CATEGORIA_F');

  INSERT INTO submissao_ishikawa (submissao_id, efeito_principal, metodo, mao_de_obra, material, medida, meio_ambiente, maquina)
  VALUES (
    sub_id,
    'Lesão Renal Aguda e Hipoglicemia Farmacológica na Enfermaria',
    'Ausência de protocolo de ajuste de dose por clearance de creatinina',
    'Sobrecarga de trabalho na prescrição médica e equipe de enfermagem reduzida',
    'Falta de alerta visual no prontuário para medicamentos nefrotóxicos',
    'Monitoramento laboratorial de escórias renais muito espaçado (a cada 5 dias)',
    'Enfermaria com alta rotatividade de pacientes e interrupções frequentes',
    'Sistema eletrônico sem validação de dose em pacientes com disfunção renal'
  );

  INSERT INTO submissao_planos_5w3h (submissao_id, o_que, por_que, quem, onde, quando, como, quanto_custa, como_medir)
  VALUES (
    sub_id,
    'Implantar alerta eletrônico de nefrotoxicidade e ajuste renal',
    'Reduzir a incidência de IRA medicamentosa em 80% na enfermaria',
    'Comissão de Farmácia e Equipe de T.I. do HU-UFS',
    'Prescrição Eletrônica HU-UFS',
    'Março de 2026',
    'Configurar bloqueio automático na prescrição de aminoglicosídeos sem dosagem recente de creatinina',
    0.00,
    'Taxa de ocorrência do gatilho M5 por 1.000 pacientes-dia'
  );

  INSERT INTO submissao_pdca (submissao_id, planejar, fazer, checar, agir)
  VALUES (
    sub_id,
    'Planejar o fluxo de bloqueio da prescrição eletrônica para fármacos nefrotóxicos em conjunto com a Farmácia Clínica',
    'Executar piloto de 30 dias na Enfermaria de Clínica Médica com apoio presencial do farmacêutico clínico',
    'Checar a adesão dos médicos residentes e monitorar a ocorrência de creatinina > 2x o basal no laboratório',
    'Padronizar a regra no sistema hospitalar definitivo e realizar treinamento com o corpo clínico'
  );

  -- Submissão 2: Aluna Juliana Campos na Atividade 2 (Nota 10.00 pela Profa. Marina)
  INSERT INTO submissoes_atividades (
    atividade_id, aluno_id, status, tempo_gasto_segundos, data_inicio, data_submissao,
    professor_corretor_id, nota, parecer_docente, data_avaliacao
  ) VALUES (
    atv2, aluno_ids[11], 'AVALIADA', 980, '2026-03-05 16:20:00-03', '2026-03-05 16:36:20-03',
    prof_marina, 10.00,
    'Desempenho impecável! Demonstrou domínio da associação entre gatilhos do bloco cirúrgico (S1) e hemovigilância (C1, C6), categorizando corretamente o dano como Categoria F. A matriz 5W3H foi precisa e aplicável à realidade do HU.',
    '2026-03-08 14:20:00-03'
  ) RETURNING id INTO sub_id;

  INSERT INTO submissao_gatilhos (submissao_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES
    (sub_id, gat_s1, cat_cirurg, true, 'Reintervenção cirúrgica de emergência nas primeiras 24 horas por sangramento intra-abdominal ativo.', false, 'CATEGORIA_F'),
    (sub_id, gat_c1, cat_cirurg, true, 'Transfusão de 2 unidades de concentrado de hemácias para choque hipovolêmico pós-operatório.', false, 'CATEGORIA_F'),
    (sub_id, gat_c6, cat_cirurg, true, 'Queda acentuada da hemoglobina de 14.1 para 7.8 g/dL em menos de 12 horas.', false, 'CATEGORIA_E');

  INSERT INTO submissao_ishikawa (submissao_id, efeito_principal, metodo, mao_de_obra, material, medida, meio_ambiente, maquina)
  VALUES (
    sub_id,
    'Hemorragia Intra-abdominal Pós-Operatória com Necessidade de Reintervenção',
    'Incompletude da etapa de Sign-out do checklist de cirurgia segura',
    'Equipe cirúrgica pressionada pelo atraso no mapa cirúrgico do dia',
    'Fio de sutura de lote com resistência mecânica reduzida',
    'Monitorização de sinais vitais na URPA a cada 60 min em vez de 15 min',
    'Sala de recuperação pós-anestésica com superlotação no plantão',
    'Foco cirúrgico com iluminação irregular que dificultou inspeção da hemostasia'
  );

  INSERT INTO submissao_planos_5w3h (submissao_id, o_que, por_que, quem, onde, quando, como, quanto_custa, como_medir)
  VALUES (
    sub_id,
    'Instituir auditoria presencial de 100% dos checklists cirúrgicos',
    'Garantir a verificação rigorosa da hemostasia antes do fechamento da cavidade',
    'Núcleo de Segurança do Paciente e Coordenação do Centro Cirúrgico',
    'Bloco Cirúrgico do HU-UFS',
    'Abril de 2026',
    'Checagem obrigatória antes do paciente sair da sala cirúrgica com assinatura em prontuário',
    0.00,
    'Taxa de conformidade do checklist cirúrgico (meta > 95%)'
  );

  INSERT INTO submissao_pdca (submissao_id, planejar, fazer, checar, agir)
  VALUES (
    sub_id,
    'Planejar revisão do protocolo de cirurgia segura da OMS no HU-UFS',
    'Realizar treinamento prático com cirurgiões, anestesistas e instrumentadores',
    'Checar semanalmente a adesão ao Sign-out e a taxa de reintervenções cirúrgicas',
    'Padronizar a checagem obrigatória da cavidade como requisito de fechamento parietal'
  );

  -- Submissão 3: Aluno Carlos Eduardo na Atividade 3 (Nota 9.00 pelo Prof. Fernando)
  INSERT INTO submissoes_atividades (
    atividade_id, aluno_id, status, tempo_gasto_segundos, data_inicio, data_submissao,
    professor_corretor_id, nota, parecer_docente, data_avaliacao
  ) VALUES (
    atv3, aluno_ids[4], 'AVALIADA', 1200, '2026-07-10 14:00:00-03', '2026-07-10 14:20:00-03',
    prof_fernando, 9.00,
    'Ótima revisão! Raciocínio clínico apurado ao registrar o gatilho I1 como infecção hospitalar com dano Categoria F e o gatilho C4 como achado complementar. O plano de ação para o bundle de PAV está alinhado às diretrizes da AMIB.',
    '2026-07-14 11:00:00-03'
  ) RETURNING id INTO sub_id;

  INSERT INTO submissao_gatilhos (submissao_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES
    (sub_id, gat_i1, cat_iras, true, 'PAV comprovada após 7 dias de ventilação mecânica na UTI por Acinetobacter baumannii.', false, 'CATEGORIA_F'),
    (sub_id, gat_c4, cat_iras, false, 'Hemoculturas sem crescimento bacteriano (gatilho positivo no prontuário mas sem bacteremia associada).', false, NULL);

  INSERT INTO submissao_ishikawa (submissao_id, efeito_principal, metodo, mao_de_obra, material, medida, meio_ambiente, maquina)
  VALUES (
    sub_id,
    'Pneumonia Associada à Ventilação Mecânica (PAV) por Bactéria Multirresistente',
    'Higiene oral com clorexidina 0,12% aplicada fora dos horários preconizados',
    'Alta proporção de pacientes sob ventilação por profissional de enfermagem',
    'Filtros bacteriológicos de linha ventilatória sem substituição no prazo',
    'Pressão de balonete (cuff) não mensurada com cufômetro a cada plantão',
    'Isolamento de contato com alta pressão de colonização bacteriana na UTI',
    'Respiradores mecânicos sem circuito fechado de aspiração contínua'
  );

  INSERT INTO submissao_planos_5w3h (submissao_id, o_que, por_que, quem, onde, quando, como, quanto_custa, como_medir)
  VALUES (
    sub_id,
    'Implantar rotina diária de checagem dos 5 itens do bundle de prevenção de PAV',
    'Reduzir a densidade de incidência de PAV em 50% na UTI geral',
    'Comissão de Controle de Infecção Hospitalar (CCIH) e Fisioterapia Respiratória',
    'Unidade de Terapia Intensiva HU-UFS',
    'Agosto de 2026',
    'Ronda diária à beira do leito checando cabeceira 30-45°, higiene oral e pressão do cuff',
    1200.00,
    'Densidade de incidência de PAV por 1.000 dias de ventilação mecânica'
  );

  INSERT INTO submissao_pdca (submissao_id, planejar, fazer, checar, agir)
  VALUES (
    sub_id,
    'Planejar protocolo com base nas recomendações da AMIB e ANVISA para infecções em UTI',
    'Capacitar médicos, enfermeiros, fisioterapeutas e técnicos da UTI Adulto',
    'Checar a conformidade diária dos leitos através de painel à vista',
    'Padronizar o registro do cufômetro no prontuário eletrônico como barreira assistencial'
  );

  -- ---------------------------------------------------------------------------
  -- 10. SUBMISSÕES PENDENTES DE CORREÇÃO (PARA TESTAR O FLUXO DO PROFESSOR)
  -- ---------------------------------------------------------------------------

  -- Pendente 1: Aluno Guilherme Medeiros na Atividade 1 (Aguardando Prof. Roberto)
  INSERT INTO submissoes_atividades (
    atividade_id, aluno_id, status, tempo_gasto_segundos, data_inicio, data_submissao
  ) VALUES (
    atv1, aluno_ids[14], 'SUBMETIDA', 1020, '2026-09-09 10:00:00-03', '2026-09-09 10:17:00-03'
  ) RETURNING id INTO sub_id;

  INSERT INTO submissao_gatilhos (submissao_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES
    (sub_id, gat_m4, cat_ram, true, 'Episódio hipoglicêmico sintomático em idoso em uso de antidiabético oral.', false, 'CATEGORIA_E'),
    (sub_id, gat_m5, cat_ram, true, 'Elevação de escórias renais decorrente de terapia com aminoglicosídeo.', false, 'CATEGORIA_F');

  INSERT INTO submissao_ishikawa (submissao_id, efeito_principal, metodo, mao_de_obra, material, medida, meio_ambiente, maquina)
  VALUES (
    sub_id,
    'Deterioração Renal e Hipoglicemia Farmacológica',
    'Ausência de conferência de função renal antes da prescrição',
    'Fadiga médica no plantão noturno',
    'Ausência de alertas de dose máxima para idosos',
    'Controle glicêmico não realizado antes da administração da medicação',
    'Unidade com alto ruído e fluxo desordenado',
    'Terminais de computador com falha de conexão com o laboratório'
  );

  INSERT INTO submissao_planos_5w3h (submissao_id, o_que, por_que, quem, onde, quando, como, quanto_custa, como_medir)
  VALUES (
    sub_id,
    'Criar protocolo de vigilância terapêutica de antibióticos nefrotóxicos',
    'Evitar insuficiência renal aguda secundária a drogas no hospital',
    'Farmácia Hospitalar e Corpo Clínico',
    'Enfermarias de Clínica Médica',
    'Outubro de 2026',
    'Implantação de checagem obrigatória de clearance estimado',
    500.00,
    'Número de eventos nefrotóxicos notificados'
  );

  INSERT INTO submissao_pdca (submissao_id, planejar, fazer, checar, agir)
  VALUES (
    sub_id,
    'Desenvolver diretriz institucional de dosagem de aminoglicosídeos',
    'Treinar médicos assistentes e residentes na aplicação do protocolo',
    'Monitorar pacientes em uso de drogas de baixo índice terapêutico semanalmente',
    'Instituir auditoria permanente de farmacovigilância'
  );

  -- Pendente 2: Aluna Heloisa Andrade na Atividade 2 (Aguardando Profa. Marina)
  INSERT INTO submissoes_atividades (
    atividade_id, aluno_id, status, tempo_gasto_segundos, data_inicio, data_submissao
  ) VALUES (
    atv2, aluno_ids[15], 'SUBMETIDA', 1150, '2026-09-10 15:00:00-03', '2026-09-10 15:19:10-03'
  ) RETURNING id INTO sub_id;

  INSERT INTO submissao_gatilhos (submissao_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES
    (sub_id, gat_s1, cat_cirurg, true, 'Hemorragia pós-apendicectomia com necessidade de nova cirurgia.', false, 'CATEGORIA_F'),
    (sub_id, gat_c6, cat_cirurg, true, 'Queda de mais de 40% nos níveis de hemoglobina no pós-operatório.', false, 'CATEGORIA_E');

  INSERT INTO submissao_ishikawa (submissao_id, efeito_principal, metodo, mao_de_obra, material, medida, meio_ambiente, maquina)
  VALUES (
    sub_id,
    'Reintervenção Cirúrgica por Hemoperitônio Pós-Operatório',
    'Fechamento parietal antes de confirmação completa da hemostasia cavitária',
    'Cirurgião sob pressão de tempo para liberação de leitos',
    'Material de síntese cirúrgica inadequado para o calibre vascular',
    'Atraso na liberação de exames laboratoriais pós-operatórios',
    'Iluminação deficiente no campo cirúrgico durante a síntese',
    'Monitor multiparamétrico da URPA com alarme sonoro desativado'
  );

  INSERT INTO submissao_planos_5w3h (submissao_id, o_que, por_que, quem, onde, quando, como, quanto_custa, como_medir)
  VALUES (
    sub_id,
    'Revisar e fiscalizar o checklist cirúrgico em 100% dos procedimentos',
    'Prevenir sangramentos ocultos e reoperações evitáveis',
    'Diretoria Técnica e Equipe de Enfermagem do Bloco Cirúrgico',
    'Salas de Cirurgia do HU-UFS',
    'Outubro de 2026',
    'Parada obrigatória no Sign-out para conferência de hemostasia',
    0.00,
    'Incidência de reintervenção cirúrgica não planejada em 30 dias'
  );

  INSERT INTO submissao_pdca (submissao_id, planejar, fazer, checar, agir)
  VALUES (
    sub_id,
    'Reavaliar as etapas do checklist com a equipe do centro cirúrgico',
    'Instituir termo de conferência de hemostasia na ficha de anestesia',
    'Auditar prontuários de pacientes reoperados quinzenalmente',
    'Padronizar as melhores práticas de cirurgia segura no regimento do bloco'
  );

  -- Pendente 3: Aluno Igor Prado na Atividade 3 (Aguardando Prof. Fernando)
  INSERT INTO submissoes_atividades (
    atividade_id, aluno_id, status, tempo_gasto_segundos, data_inicio, data_submissao
  ) VALUES (
    atv3, aluno_ids[16], 'SUBMETIDA', 1250, '2026-09-11 11:00:00-03', '2026-09-11 11:20:50-03'
  ) RETURNING id INTO sub_id;

  INSERT INTO submissao_gatilhos (submissao_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES
    (sub_id, gat_i1, cat_iras, true, 'PAV confirmada no D7 de VM com cultura positiva para patógeno hospitalar.', false, 'CATEGORIA_F');

  INSERT INTO submissao_ishikawa (submissao_id, efeito_principal, metodo, mao_de_obra, material, medida, meio_ambiente, maquina)
  VALUES (
    sub_id,
    'Infecção Respiratória Nosocomial Associada à Ventilação Mecânica',
    'Descontinuidade na elevação da cabeceira do leito entre 30 e 45 graus',
    'Falta de treinamento de novos membros da equipe assistencial',
    'Escassez de kits de higiene oral com clorexidina na unidade',
    'Inexistência de indicador à vista sobre tempo de ventilação mecânica',
    'Ambiente da UTI com alta carga bacteriana e rotatividade de leitos',
    'Equipamentos de aspiração traqueal com manutenção preventiva vencida'
  );

  INSERT INTO submissao_planos_5w3h (submissao_id, o_que, por_que, quem, onde, quando, como, quanto_custa, como_medir)
  VALUES (
    sub_id,
    'Implantar auditoria diária do bundle de ventilação mecânica',
    'Zerar as infecções respiratórias preveníveis na UTI Adulto',
    'Coordenação de Enfermagem da UTI e CCIH',
    'Leitos da UTI Adulto HU-UFS',
    'Novembro de 2026',
    'Aplicação de checklist diário à beira do leito em três turnos',
    300.00,
    'Taxa de adesão ao bundle de PAV'
  );

  INSERT INTO submissao_pdca (submissao_id, planejar, fazer, checar, agir)
  VALUES (
    sub_id,
    'Estruturar formulário eletrônico simples para checagem do bundle de PAV',
    'Treinar todos os plantonistas na rotina de mensuração de cuff e cabeceira',
    'Examinar os relatórios microbiológicos mensais da CCIH',
    'Reconhecer as equipes com maior taxa de conformidade e padronizar o método'
  );

  -- ---------------------------------------------------------------------------
  -- 11. SUBMISSÃO EM ANDAMENTO (RASCUNHO DO ALUNO - TESTAR RETOMADA)
  -- ---------------------------------------------------------------------------
  -- Aluna Letícia Tavares na Atividade 4 (Em Andamento)
  INSERT INTO submissoes_atividades (
    atividade_id, aluno_id, status, tempo_gasto_segundos, data_inicio, data_submissao
  ) VALUES (
    atv4, aluno_ids[17], 'EM_ANDAMENTO', 420, '2026-09-12 10:00:00-03', NULL
  ) RETURNING id INTO sub_id;

  INSERT INTO submissao_gatilhos (submissao_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
  VALUES
    (sub_id, gat_c2, cat_ram, true, 'Parada cardiorrespiratória por choque anafilático após administração de dipirona.', false, 'CATEGORIA_H');

  INSERT INTO submissao_ishikawa (submissao_id, efeito_principal, metodo, mao_de_obra, material, medida, meio_ambiente, maquina)
  VALUES (
    sub_id,
    'Choque Anafilático e PCR por Alergia Medicamentosa no Pronto-Socorro',
    'Não verificação do registro de alergia constante na ficha de acolhimento',
    'Equipe de enfermagem sobrecarregada com grande fluxo de urgência',
    'Ausência de pulseira vermelha de alerta de alergia no paciente',
    'Falta de dupla checagem na administração de injetáveis',
    'Sala de medicação do PS com ruído excessivo',
    'Carrinho de parada cardíaca sem laringoscópio testado previamente'
  );

  -- (Aluna ainda não preencheu 5W3H e PDCA -> Rascunho salvo para continuar!)

  RAISE NOTICE '✔ [SUCESSO] Carga Educacional HU-UFS 2026 inserida com perfeição!';
END $$;
