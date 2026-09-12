-- =============================================================================
-- SIGEA-GTT: Script DML Supremo de Simulacao Clinica para Apresentacao ao HU-UFS
-- V3__dml_simulado.sql
-- 5 Professores | 250 Alunos | 5 Turmas | 15 Cenarios Clinicos | 45 Prontuarios
-- 15 Atividades de Auditoria | 2.250 Revisoes Individuais com Achados GTT,
-- Validacoes Docentes, Analises de Ishikawa, Planos 5W3H e Ciclos PDCA.
-- =============================================================================

DO $$
DECLARE
  -- Professores
  prof1 BIGINT; prof2 BIGINT; prof3 BIGINT; prof4 BIGINT; prof5 BIGINT;

  -- Turmas
  turma1 BIGINT; turma2 BIGINT; turma3 BIGINT; turma4 BIGINT; turma5 BIGINT;

  -- Unidades Hospitalares (HU-UFS)
  uh_cmed  BIGINT; uh_ccir  BIGINT; uh_utia  BIGINT;
  uh_mat   BIGINT; uh_sue   BIGINT; uh_urpa  BIGINT;

  -- Cenarios Clinicos (3 por turma = 15 total)
  cen1_1 BIGINT; cen1_2 BIGINT; cen1_3 BIGINT;
  cen2_1 BIGINT; cen2_2 BIGINT; cen2_3 BIGINT;
  cen3_1 BIGINT; cen3_2 BIGINT; cen3_3 BIGINT;
  cen4_1 BIGINT; cen4_2 BIGINT; cen4_3 BIGINT;
  cen5_1 BIGINT; cen5_2 BIGINT; cen5_3 BIGINT;

  -- Atividades de Auditoria (3 por turma = 15 total)
  atv1_1 BIGINT; atv1_2 BIGINT; atv1_3 BIGINT;
  atv2_1 BIGINT; atv2_2 BIGINT; atv2_3 BIGINT;
  atv3_1 BIGINT; atv3_2 BIGINT; atv3_3 BIGINT;
  atv4_1 BIGINT; atv4_2 BIGINT; atv4_3 BIGINT;
  atv5_1 BIGINT; atv5_2 BIGINT; atv5_3 BIGINT;

  -- Variaveis de controle e iteracao
  v_aluno_id   BIGINT;
  v_revisao_id BIGINT;
  i            INT;
  pront_ids  BIGINT[];
  turma_cur  BIGINT;
  prof_cur   BIGINT;
  cen_ids    BIGINT[];
  atv_ids    BIGINT[];
  aluno_ids  BIGINT[];

  gat          BIGINT;
  gat2         BIGINT;
  v_turma_idx  INT;
  v_aluno_idx  INT;
  v_pront_idx  INT;
  v_atv_idx    INT;
  v_hash       INT;
  v_finalizada BOOLEAN;
  v_tempo      INT;
  v_confirma   BOOLEAN;
  v_dano_adm   BOOLEAN;
  v_gravidade  TEXT;
  v_homologado BOOLEAN;
  v_confirma2  BOOLEAN;
  v_grav2      TEXT;

  -- Senha padrao para todos: Sigea@123
  senha_padrao TEXT := '$2a$10$QrlMhf/Wah7PtuldYOCIOevxYBCx1f0pxoKLSJe5fmyiqzIotQ/M6';

  -- Gatilhos GTT carregados por codigo
  gat_c1  BIGINT; gat_c3  BIGINT; gat_c4  BIGINT; gat_c6  BIGINT; gat_c7  BIGINT; gat_c8  BIGINT;
  gat_c11 BIGINT; gat_c13 BIGINT;
  gat_m1  BIGINT; gat_m2  BIGINT; gat_m3  BIGINT; gat_m4  BIGINT; gat_m5  BIGINT;
  gat_m6  BIGINT; gat_m9  BIGINT; gat_m10 BIGINT; gat_m11 BIGINT; gat_m12 BIGINT;
  gat_s1  BIGINT; gat_s3  BIGINT; gat_s4  BIGINT; gat_s7  BIGINT; gat_s11 BIGINT;
  gat_i1  BIGINT; gat_i2  BIGINT; gat_i3  BIGINT; gat_i4  BIGINT;
  gat_p2  BIGINT; gat_p3  BIGINT; gat_p4  BIGINT; gat_p6  BIGINT; gat_p7  BIGINT;

  -- Categorias de Eventos Adversos
  cat_infec  BIGINT;
  cat_med    BIGINT;
  cat_cirurg BIGINT;
  cat_obstet BIGINT;
  cat_danos  BIGINT;

  -- 250 Alunos (50 por turma)
  nomes_t1 TEXT[] := ARRAY[
    'Adriana Melo Souza','Beatriz Lima Costa','Bruno Alves Pereira','Camila Rocha Ferreira','Carlos Eduardo Santos',
    'Carolina Vieira Nunes','Daniela Pinto Andrade','Diego Carvalho Ramos','Eduardo Borges Teixeira','Fabiana Moura Gomes',
    'Felipe Nascimento Cruz','Fernanda Dias Lopes','Gabriel Silva Barbosa','Giovanna Correia Faria','Gustavo Araujo Cunha',
    'Helena Martins Ribeiro','Igor Castro Mendes','Isabela Freitas Cardoso','Joao Pedro Oliveira Lima','Juliana Sousa Campos',
    'Larissa Brito Monteiro','Leonardo Duarte Viana','Leticia Tavares Amaral','Lucas Azevedo Sampaio','Luisa Fernandes Pires',
    'Marcelo Aguiar Rezende','Mariana Barros Nogueira','Mateus Rodrigues Guimaraes','Mirela Santos Paiva','Nathalia Costa Xavier',
    'Nicolas Lemos Cavalcante','Patricia Moraes Albuquerque','Paulo Cesar Torres Braga','Pedro Henrique Queiroz','Priscila Batista Machado',
    'Rafael Gomes Leite','Rafaela Nobre Dantas','Renata Figueiredo Borba','Ricardo Coelho Siqueira','Roberta Vargas Esteves',
    'Rodrigo Marques Alencar','Sara Peixoto Pessoa','Tamara Jordao Lima','Tiago Maia Falcao','Thais Veloso Bezerra',
    'Vanessa Carvalho Luz','Victor Hugo Passos','Vinicius Almeida Fonseca','Yasmin Furtado Lacerda','Yago Bentes Magalhaes'
  ];

  nomes_t2 TEXT[] := ARRAY[
    'Aline Ventura Rodrigues','Amanda Leal Carmo','Andre Sousa Medeiros','Bianca Tavares Muniz','Bruna Correa Silveira',
    'Caio Rezende Bonfim','Camilo Alves Saraiva','Cintia Lopes Moreira','Clarice Feitosa Barros','Cristian Duarte Vasconcelos',
    'Danilo Freire Matos','Debora Souza Pinheiro','Erica Brandao Paiva','Estevao Campos Melo','Fabio Torres Bezerra',
    'Flavio Lima Sa','Gabriele Santana Andrade','Geovane Moura Bastos','Graziela Ramos Novaes','Guilherme Costa Medeiros',
    'Heloisa Vieira Andrade','Henrique Teles Carvalho','Iara Mendes Borges','Igor Prado Souza','Iris Castro Couto',
    'Jessica Farias Neves','Jonathan Macedo Cunha','Joyce Pires Gomes','Kaique Martins Leite','Karen Ferreira Maia',
    'Kaylane Rocha Brito','Leandro Albuquerque Sales','Livia Barros Cruz','Lorena Fonseca Prado','Luan Gomes Araujo',
    'Luciana Pereira Nogueira','Marcos Batista Lopes','Mariana Magalhaes Lima','Mayara Azevedo Torres','Michelle Borba Lima',
    'Murilo Santos Braga','Nayara Lima Moraes','Pablo Couto Viana','Renato Alencar Gomes','Robson Cavalcante Dantas',
    'Sabrina Duarte Cardoso','Samuel Figueiredo Bento','Suelen Ramos Cunha','Tatiane Nunes Pereira','Thiago Correa Maciel'
  ];

  nomes_t3 TEXT[] := ARRAY[
    'Adilson Mota Pinheiro','Agatha Ferraz Lemos','Alex Melo Correia','Alexia Barbosa Torres','Allan Costa Oliveira',
    'Alicia Brandao Figueiredo','Ana Beatriz Pinto Sousa','Ana Clara Vasconcelos','Ana Laura Rodrigues Diniz','Ana Luiza Gomes Neto',
    'Anderson Furtado Barros','Andresa Cavalcanti Lima','Antonio Carlos Ramos Filho','Artur Sousa Magalhaes','Barbara Lins Nascimento',
    'Betania Ferreira Moura','Breno Tavares Almeida','Bruno Carvalho Marques','Carla Souza Freitas','Carlos Alberto Duarte Neto',
    'Celso Melo Monteiro','Cibele Rocha Santos','Cicero Batista Lima','Clarissa Lopes Aguiar','Cleyton Mendes Carvalho',
    'Cristiane Borges Faria','Daiane Sousa Correa','Damiao Ferreira Cruz','Danielle Castro Lima','Dayane Mota Pires',
    'Debora Alves Araujo','Denis Rocha Pessoa','Denise Figueira Santos','Diego Melo Brito','Diogo Macedo Lopes',
    'Edson Tavares Moura','Elaine Borges Carvalho','Elen Souza Lima','Eliane Mota Freitas','Elisa Pinto Dantas',
    'Elisio Ramos Cunha','Elton Martins Barros','Erica Sousa Medeiros','Erick Melo Novaes','Erika Ferreira Bento',
    'Ernesto Lima Andrade','Estela Borges Correa','Euler Santos Gomes','Eva Mota Cruz','Evandra Rodrigues Furtado'
  ];

  nomes_t4 TEXT[] := ARRAY[
    'Fabio Carvalho Sousa','Fabiola Martins Lima','Fabricio Borges Ferreira','Fausto Rodrigues Santos','Fernanda Lima Barros',
    'Fernando Melo Costa','Filipe Rocha Andrade','Filipi Souza Correa','Flaviane Monteiro Alves','Flavio Carvalho Neto',
    'Francesca Brito Lima','Francis Mota Araujo','Francisco Tavares Cunha','Frederico Borges Pereira','Gael Martins Lopes',
    'Geilson Rocha Santos','Genilson Costa Lima','Giovani Ferreira Melo','Gisele Mota Barbosa','Giselly Carvalho Duarte',
    'Glaucia Santos Correa','Gleison Lima Brito','Graca Rodrigues Mota','Greice Santos Andrade','Guilherme Borges Lima',
    'Gustavo Carvalho Santos','Hanna Melo Ferreira','Haroldo Souza Rocha','Hector Brito Andrade','Heitor Lima Correa',
    'Helaine Mota Santos','Heleno Carvalho Borges','Herlandia Rocha Lima','Herminia Santos Melo','Heverton Andrade Correa',
    'Hosana Lima Mota','Hugo Ferreira Rocha','Hygor Borges Santos','Iara Carvalho Lima','Iasmin Melo Correa',
    'Ibrahim Santos Andrade','Icaro Lima Mota','Ieda Rocha Borges','Igor Ferreira Lima','Ilda Santos Carvalho',
    'Ildete Lima Correa','Ilka Mota Santos','Ilton Rocha Andrade','Ingrid Lima Ferreira','Ingridy Santos Melo'
  ];

  nomes_t5 TEXT[] := ARRAY[
    'Ionara Mota Correa','Iracema Lima Santos','Iraides Rocha Andrade','Irene Carvalho Melo','Irma Santos Lima',
    'Isaac Mota Ferreira','Isabel Borges Correa','Isabelle Lima Santos','Isadora Rocha Carvalho','Isadora Melo Andrade',
    'Isaque Santos Mota','Isaulino Lima Borges','Isnaldo Ferreira Santos','Isoneide Carvalho Lima','Italo Rocha Melo',
    'Italo Correa Santos','Ivan Lima Andrade','Ivana Santos Carvalho','Ivanete Mota Lima','Ivanildo Ferreira Borges',
    'Ivete Rocha Santos','Ivonete Lima Correa','Ivoni Carvalho Melo','Jadson Mota Santos','Jaine Lima Ferreira',
    'Jailma Borges Correa','Jailson Santos Andrade','Jailton Lima Mota','Jaime Rocha Carvalho','Jainara Santos Lima',
    'Jaiuza Melo Borges','Jaivis Lima Ferreira','Jakeline Santos Correa','Jakelyne Carvalho Lima','Jamilton Mota Andrade',
    'Janaina Borges Rocha','Janaina Lima Santos','Janailson Ferreira Melo','Janelle Santos Mota','Janete Lima Correa',
    'Janiele Carvalho Andrade','Janilson Borges Lima','Janira Santos Ferreira','Janissa Mota Rocha','Jaqueline Lima Santos',
    'Jaqueline Correa Borges','Jardel Carvalho Melo','Jarina Santos Lima','Jarisson Melo Ferreira','Jasmine Borges Correa'
  ];

BEGIN

  -- Se ja existem turmas do periodo 2025.2, nao duplica a carga
  IF EXISTS (SELECT 1 FROM turmas WHERE ano_semestre = '2025/2') THEN
    RAISE NOTICE 'Dados simulados ja estao carregados na base de dados.';
    RETURN;
  END IF;

  -- =========================================================================
  -- 0. GARANTIR CATEGORIAS DE EVENTOS ADVERSOS
  -- =========================================================================
  INSERT INTO categorias_eventos_adversos (nome, definicao_operacional, ativa) VALUES
    ('Infeccoes Relacionadas a Assistencia (IRAS)', 'Infeccoes diagnosticadas apos 48 horas da admissao hospitalar ou associadas a procedimentos e dispositivos invasivos.', TRUE),
    ('Eventos Adversos a Medicamentos (RAM / EAM)', 'Danos temporarios ou permanentes decorrentes do uso, dosagem incorreta, toxicidade ou reacao adversa a farmacos.', TRUE),
    ('Complicacoes Cirurgicas e Procedimentais', 'Danos decorrentes de intervencoes cirurgicas, atos anestesicos ou procedimentos invasivos no perioperatorio.', TRUE),
    ('Eventos Perinatais e Obstetricos', 'Danos a saude materna ou fetal/neonatal decorrentes da assistencia ao pre-parto, parto e puerperio imediato.', TRUE),
    ('Danos Fisicos, Quedas e Lesoes por Pressao', 'Lesoes corporais decorrentes de quedas nas instalacoes hospitalares ou lesoes por pressao adquiridas.', TRUE)
  ON CONFLICT (nome) DO NOTHING;

  SELECT id INTO cat_infec  FROM categorias_eventos_adversos WHERE nome ILIKE '%Infeccoes%' LIMIT 1;
  SELECT id INTO cat_med    FROM categorias_eventos_adversos WHERE nome ILIKE '%Medicamentos%' LIMIT 1;
  SELECT id INTO cat_cirurg FROM categorias_eventos_adversos WHERE nome ILIKE '%Cirurgicas%' LIMIT 1;
  SELECT id INTO cat_obstet FROM categorias_eventos_adversos WHERE nome ILIKE '%Obstetricos%' LIMIT 1;
  SELECT id INTO cat_danos  FROM categorias_eventos_adversos WHERE nome ILIKE '%Quedas%' LIMIT 1;

  -- Unidades Hospitalares
  SELECT id INTO uh_cmed  FROM unidades_hospitalares WHERE sigla = 'CMED'  LIMIT 1;
  SELECT id INTO uh_ccir  FROM unidades_hospitalares WHERE sigla = 'CCIR'  LIMIT 1;
  SELECT id INTO uh_utia  FROM unidades_hospitalares WHERE sigla = 'UTI-A' LIMIT 1;
  SELECT id INTO uh_mat   FROM unidades_hospitalares WHERE sigla = 'MAT'   LIMIT 1;
  SELECT id INTO uh_sue   FROM unidades_hospitalares WHERE sigla = 'SUE'   LIMIT 1;
  SELECT id INTO uh_urpa  FROM unidades_hospitalares WHERE sigla = 'URPA'  LIMIT 1;

  -- Gatilhos GTT
  SELECT id INTO gat_c1  FROM gatilhos_gtt WHERE codigo = 'C1';
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
  SELECT id INTO gat_m10 FROM gatilhos_gtt WHERE codigo = 'M10';
  SELECT id INTO gat_m11 FROM gatilhos_gtt WHERE codigo = 'M11';
  SELECT id INTO gat_m12 FROM gatilhos_gtt WHERE codigo = 'M12';
  SELECT id INTO gat_s1  FROM gatilhos_gtt WHERE codigo = 'S1';
  SELECT id INTO gat_s3  FROM gatilhos_gtt WHERE codigo = 'S3';
  SELECT id INTO gat_s4  FROM gatilhos_gtt WHERE codigo = 'S4';
  SELECT id INTO gat_s7  FROM gatilhos_gtt WHERE codigo = 'S7';
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

  -- =========================================================================
  -- 1. PROFESSORES (5 Docentes Especialistas)
  -- =========================================================================
  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Dr. Ricardo Alves Mendes', 'ricardomendes@hu.ufs.br', '202310001', 'PROFESSOR', senha_padrao, FALSE, TRUE)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha RETURNING id INTO prof1;
  IF prof1 IS NULL THEN SELECT id INTO prof1 FROM usuarios WHERE email = 'ricardomendes@hu.ufs.br'; END IF;

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Dra. Ana Paula Ferreira', 'anaferreira@hu.ufs.br', '202310002', 'PROFESSOR', senha_padrao, FALSE, TRUE)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha RETURNING id INTO prof2;
  IF prof2 IS NULL THEN SELECT id INTO prof2 FROM usuarios WHERE email = 'anaferreira@hu.ufs.br'; END IF;

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Dr. Carlos Eduardo Lima', 'carloslima@hu.ufs.br', '202310003', 'PROFESSOR', senha_padrao, FALSE, TRUE)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha RETURNING id INTO prof3;
  IF prof3 IS NULL THEN SELECT id INTO prof3 FROM usuarios WHERE email = 'carloslima@hu.ufs.br'; END IF;

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Dra. Fernanda Cristina Costa', 'fernandacosta@hu.ufs.br', '202310004', 'PROFESSOR', senha_padrao, FALSE, TRUE)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha RETURNING id INTO prof4;
  IF prof4 IS NULL THEN SELECT id INTO prof4 FROM usuarios WHERE email = 'fernandacosta@hu.ufs.br'; END IF;

  INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
  VALUES ('Dra. Patricia Vieira Alves', 'patriciaalves@hu.ufs.br', '202310005', 'PROFESSOR', senha_padrao, FALSE, TRUE)
  ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha RETURNING id INTO prof5;
  IF prof5 IS NULL THEN SELECT id INTO prof5 FROM usuarios WHERE email = 'patriciaalves@hu.ufs.br'; END IF;

  -- =========================================================================
  -- 2. TURMAS (5 Turmas Academicas no Periodo 2025.2)
  -- =========================================================================
  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, periodo_letivo, ano_semestre, ativa)
  VALUES (prof1, 'MED4201 - Clin. Medica', '2025.2', '2025/2', TRUE) RETURNING id INTO turma1;

  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, periodo_letivo, ano_semestre, ativa)
  VALUES (prof2, 'FAR3105 - Farmacologia', '2025.2', '2025/2', TRUE) RETURNING id INTO turma2;

  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, periodo_letivo, ano_semestre, ativa)
  VALUES (prof3, 'CIR4302 - Cirurgia Geral', '2025.2', '2025/2', TRUE) RETURNING id INTO turma3;

  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, periodo_letivo, ano_semestre, ativa)
  VALUES (prof4, 'UTI5001 - Med. Intensiva', '2025.2', '2025/2', TRUE) RETURNING id INTO turma4;

  INSERT INTO turmas (professor_responsavel_id, codigo_disciplina, periodo_letivo, ano_semestre, ativa)
  VALUES (prof5, 'OBS4410 - Obstetricia', '2025.2', '2025/2', TRUE) RETURNING id INTO turma5;

  -- =========================================================================
  -- 3. ALUNOS E MATRICULAS (50 Alunos por Turma = 250 Total)
  -- =========================================================================
  FOR i IN 1..50 LOOP
    INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
    VALUES (nomes_t1[i], lower(replace(nomes_t1[i],' ','.'))||'.t1@academico.ufs.br', lpad((2024000+i)::text, 9, '0'), 'ALUNO', senha_padrao, FALSE, TRUE)
    ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha RETURNING id INTO v_aluno_id;
    IF v_aluno_id IS NULL THEN SELECT u.id INTO v_aluno_id FROM usuarios u WHERE u.email = lower(replace(nomes_t1[i],' ','.'))||'.t1@academico.ufs.br'; END IF;
    INSERT INTO turma_alunos (turma_id, aluno_id) VALUES (turma1, v_aluno_id) ON CONFLICT DO NOTHING;
  END LOOP;

  FOR i IN 1..50 LOOP
    INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
    VALUES (nomes_t2[i], lower(replace(nomes_t2[i],' ','.'))||'.t2@academico.ufs.br', lpad((2024100+i)::text, 9, '0'), 'ALUNO', senha_padrao, FALSE, TRUE)
    ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha RETURNING id INTO v_aluno_id;
    IF v_aluno_id IS NULL THEN SELECT u.id INTO v_aluno_id FROM usuarios u WHERE u.email = lower(replace(nomes_t2[i],' ','.'))||'.t2@academico.ufs.br'; END IF;
    INSERT INTO turma_alunos (turma_id, aluno_id) VALUES (turma2, v_aluno_id) ON CONFLICT DO NOTHING;
  END LOOP;

  FOR i IN 1..50 LOOP
    INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
    VALUES (nomes_t3[i], lower(replace(nomes_t3[i],' ','.'))||'.t3@academico.ufs.br', lpad((2024200+i)::text, 9, '0'), 'ALUNO', senha_padrao, FALSE, TRUE)
    ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha RETURNING id INTO v_aluno_id;
    IF v_aluno_id IS NULL THEN SELECT u.id INTO v_aluno_id FROM usuarios u WHERE u.email = lower(replace(nomes_t3[i],' ','.'))||'.t3@academico.ufs.br'; END IF;
    INSERT INTO turma_alunos (turma_id, aluno_id) VALUES (turma3, v_aluno_id) ON CONFLICT DO NOTHING;
  END LOOP;

  FOR i IN 1..50 LOOP
    INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
    VALUES (nomes_t4[i], lower(replace(nomes_t4[i],' ','.'))||'.t4@academico.ufs.br', lpad((2024300+i)::text, 9, '0'), 'ALUNO', senha_padrao, FALSE, TRUE)
    ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha RETURNING id INTO v_aluno_id;
    IF v_aluno_id IS NULL THEN SELECT u.id INTO v_aluno_id FROM usuarios u WHERE u.email = lower(replace(nomes_t4[i],' ','.'))||'.t4@academico.ufs.br'; END IF;
    INSERT INTO turma_alunos (turma_id, aluno_id) VALUES (turma4, v_aluno_id) ON CONFLICT DO NOTHING;
  END LOOP;

  FOR i IN 1..50 LOOP
    INSERT INTO usuarios (nome_completo, email, matricula_sigaa, perfil, senha, primeiro_acesso, ativo)
    VALUES (nomes_t5[i], lower(replace(nomes_t5[i],' ','.'))||'.t5@academico.ufs.br', lpad((2024400+i)::text, 9, '0'), 'ALUNO', senha_padrao, FALSE, TRUE)
    ON CONFLICT (email) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, senha = EXCLUDED.senha RETURNING id INTO v_aluno_id;
    IF v_aluno_id IS NULL THEN SELECT u.id INTO v_aluno_id FROM usuarios u WHERE u.email = lower(replace(nomes_t5[i],' ','.'))||'.t5@academico.ufs.br'; END IF;
    INSERT INTO turma_alunos (turma_id, aluno_id) VALUES (turma5, v_aluno_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- =========================================================================
  -- 4. CENARIOS CLINICOS (15 Cenarios - 3 por Turma)
  -- =========================================================================

  -- TURMA 1 - CLINICA MEDICA
  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof1,
    'Infeccao Hospitalar por C. difficile em Paciente Anticoagulado',
    'Homem, 67 anos, internado por pneumonia adquirida na comunidade. Recebeu ceftriaxona e azitromicina por 10 dias. No 8 dia desenvolveu diarreia aquosa profusa, colicas abdominais e febre. Pesquisa de toxina para C. difficile positiva. Simultaneamente, em uso de varfarina por fibrilacao atrial com INR 7,2 e hematuria macroscopica. Necessitou de transferencia para monitorizacao cardiaca especializada.',
    '1. Identificar gatilhos GTT: M1 (C. difficile) e M3 (INR alto). 2. Analisar o impacto de multiplos eventos adversos no tempo de permanencia. 3. Propor medidas de prevencao para IRAS e controle de anticoagulacao. 4. Aplicar analise de Ishikawa para causas-raiz da infeccao hospitalar.')
  RETURNING id INTO cen1_1;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof1,
    'Queda com Lesao por Pressao em Idoso Hospitalizado',
    'Mulher, 78 anos, admitida por descompensacao de ICC. Mobilidade reduzida e estado confusional leve. No 5 dia sofreu queda da poltrona com fratura de radio distal. Adicionalmente, lesao por pressao sacral estagio II nao registrada na admissao evoluiu para estagio III durante internacao.',
    '1. Reconhecer os gatilhos C7 (queda) e C8 (lesao por pressao). 2. Discutir protocolos de prevencao de quedas e avaliacao de risco cutaneo (Braden). 3. Refletir sobre falhas sistemicas na avaliacao de risco na admissao. 4. Elaborar plano de acao 5W3H para prevencao de recorrencia.')
  RETURNING id INTO cen1_2;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof1,
    'Readmissao Precoce por Descompensacao Pos-Alta e Transferencia para UTI',
    'Homem, 54 anos, portador de DPOC grave, teve alta apos exacerbacao. Retornou ao PS em 12 dias por dispneia grave, hipoxemia (SpO2 78%) e confusao mental. Necessitou de intubacao e transferencia para UTI. Hemocultura positiva para S. aureus. Hemoglobina com reducao >35% em relacao a internacao anterior.',
    '1. Identificar gatilhos C9 (readmissao <=30 dias), C13 (transferencia para UTI), C4 (hemocultura positiva) e C6 (queda >25% de hemoglobina). 2. Avaliar criterios de alta segura. 3. Analisar barreiras sistemicas para readmissao precoce. 4. Aplicar ciclo PDCA para protocolo de alta supervisionada em DPOC.')
  RETURNING id INTO cen1_3;

  -- TURMA 2 - FARMACOLOGIA CLINICA
  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof2,
    'Depressao Respiratoria por Opioide com Uso de Naloxona',
    'Mulher, 45 anos, pos-operatorio de colecistectomia laparoscopica. Recebeu morfina IV 8 mg e, apos 90 minutos, apresentou FR 6 irpm, SpO2 82%, sonolencia profunda e miose. Enfermagem acionou medico que administrou naloxona 0,4 mg IV com reversao do quadro. Nauseas e vomitos intensos retardaram a dieta.',
    '1. Reconhecer o gatilho M9 (uso de naloxona) e M10 (antiemeticos). 2. Compreender farmacologia dos opioides e fatores de risco para depressao respiratoria. 3. Identificar falhas na monitorizacao pos-operatoria imediata. 4. Propor protocolo de seguranca para analgesia opioide em URPA.')
  RETURNING id INTO cen2_1;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof2,
    'Hipoglicemia Grave por Insulina em Paciente Diabetico Hospitalizado',
    'Homem, 61 anos, DM2, internado por celulite. Em esquema de insulina NPH 30 UI e regular por escala. No 3 dia, apos reducao do apetite nao comunicada, apresentou glicemia de 34 mg/dL, sudorese fria, tremores, confusao mental e perda de consciencia transitoria. Revertido com glicose 50% IV.',
    '1. Identificar o gatilho M4 (hipoglicemia grave <50 mg/dL). 2. Discutir protocolos de monitorizacao glicemica e comunicacao interprofissional. 3. Avaliar falhas na interface prescricao-administracao-monitorizacao de insulina. 4. Elaborar analise de Ishikawa focando nas causas-raiz da hipoglicemia hospitalar.')
  RETURNING id INTO cen2_2;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof2,
    'Nefrotoxicidade por Aminoglicosideo e Suspensao Abrupta de Anti-hipertensivo',
    'Mulher, 58 anos, internada por pielonefrite complicada. Recebeu gentamicina 240 mg/dia por 10 dias sem monitorizacao. Na 2 semana apresentou creatinina 3,8 mg/dL (basal 0,9), oliguria e edema. Enalapril suspenso abruptamente gerando crise hipertensiva (PA 220x130 mmHg). Necessitou dialise de urgencia.',
    '1. Identificar os gatilhos M5 (nefrotoxicidade >2x basal) e M12 (suspensao abrupta de medicamento). 2. Compreender o papel da farmacovigilancia e monitorizacao terapeutica de antibioticos. 3. Discutir protocolos de reconciliacao medicamentosa na internacao. 4. Propor plano de acao 5W3H para prevencao de nefrotoxicidade.')
  RETURNING id INTO cen2_3;

  -- TURMA 3 - CIRURGIA GERAL
  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof3,
    'Reintervencao Cirurgica por Hemorragia Pos-Apendicectomia',
    'Homem, 32 anos, submetido a apendicectomia videolaparoscopica. No D1 pos-operatorio apresentou distensao abdominal, hipotensao (PA 80x50 mmHg), taquicardia 130 bpm e queda de Hb de 13,2 para 7,1 g/dL em 6 horas. Retornou ao CC de urgencia: hemoperitonio por coto apendicular mal ligado. Necessitou de transfusao de 4 CH.',
    '1. Identificar os gatilhos S1 (retorno nao planejado ao CC) e C1 (transfusao alem do esperado). 2. Analisar a cadeia de eventos da hemorragia pos-operatoria. 3. Discutir criterios de alta para cirurgia laparoscopica e monitorizacao pos-operatoria. 4. Aplicar ciclo PDCA para protocolo de deteccao precoce de complicacoes.')
  RETURNING id INTO cen3_1;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof3,
    'Infeccao de Sitio Cirurgico e Complicacoes Pos-Gastrectomia',
    'Mulher, 55 anos, gastrectomia subtotal por adenocarcinoma gastrico. No D7 pos-operatorio: febre, eritema, calor e secrecao purulenta na ferida. Cultura: Klebsiella pneumoniae ESBL+. Necessitou antibioticoterapia IV prolongada e debridamento. Permaneceu internada por mais 21 dias alem do planejado (total 35 dias).',
    '1. Reconhecer o gatilho S11 (complicacao pos-cirurgica) e C11 (IRAS). 2. Discutir medidas de prevencao de ISC baseadas em evidencias. 3. Analisar o impacto clinico e economico do prolongamento da internacao por ISC. 4. Elaborar analise de Ishikawa para a ISC por germe multirresistente.')
  RETURNING id INTO cen3_2;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof3,
    'Admissao Nao Planejada em UTI Pos-Herniorrafia com Falha de Extubacao',
    'Homem, 48 anos, herniorrafia inguinal bilateral sob anestesia geral. Na URPA: broncoespasmo grave, saturacao 78%, necessidade de reintubacao e transferencia a UTI. Evoluiu com PAV no 4 dia de UTI por P. aeruginosa. Permaneceu 9 dias em ventilacao mecanica.',
    '1. Identificar os gatilhos S4 (reintubacao na URPA), S3 (admissao nao planejada em UTI) e I1 (PAV). 2. Avaliar preditores de complicacoes respiratorias pos-operatorias. 3. Discutir protocolos de bundle de prevencao de PAV. 4. Propor plano 5W3H para processo de extubacao segura.')
  RETURNING id INTO cen3_3;

  -- TURMA 4 - MEDICINA INTENSIVA
  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof4,
    'Pneumonia Associada a Ventilacao Mecanica em Paciente Septico',
    'Homem, 64 anos, admitido em UTI por sepse abdominal pos-perfuracao de ulcera peptica. Intubado no PS. No D6 de UTI: febre alta, secrecao traqueal purulenta, piora ventilatoria e infiltrado bilateral. Broncoscopia: P. aeruginosa MDR. Diagnosticada PAV.',
    '1. Identificar o gatilho I1 (PAV) e seus criterios diagnosticos. 2. Discutir o bundle de prevencao de PAV. 3. Analisar o impacto da multirresistencia bacteriana e estrategias de stewardship. 4. Elaborar ciclo PDCA para implementacao do bundle de PAV.')
  RETURNING id INTO cen4_1;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof4,
    'Readmissao em UTI e Reintubacao Nao Planejada',
    'Mulher, 51 anos, SDRA por COVID-19. Extubada apos 14 dias de VM e transferida para enfermaria. Em 36 horas: insuficiencia respiratoria progressiva, retorno a UTI e reintubacao de urgencia. Investigacao identificou A. baumannii e sindrome de fraqueza do doente critico.',
    '1. Reconhecer os gatilhos I2 (readmissao em UTI) e I4 (reintubacao nao planejada). 2. Discutir criterios de prontidao para extubacao e transferencia segura da UTI. 3. Avaliar o impacto da ICU-AW no desmame ventilatorio. 4. Propor protocolo de monitorizacao respiratoria pos-extubacao.')
  RETURNING id INTO cen4_2;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof4,
    'Complicacoes de Cateter Venoso Central e Hemorragia Digestiva em UTI',
    'Homem, 72 anos, choque septico de foco urinario em UTI. Durante insercao de CVC em subclavia esquerda ocorreu pneumotorax iatrogenico necessitando drenagem pleural. No D3 de UTI: hematemese volumosa por ulcera de estresse. TTPa 120 seg em uso de heparina terapeutica. Recebeu 3 CH.',
    '1. Identificar os gatilhos I3 (procedimento em UTI com complicacao), M2 (TTPa >100 seg) e C1 (transfusao alem da perda esperada). 2. Analisar complicacoes de dispositivos invasivos na UTI. 3. Discutir profilaxia de ulcera de estresse e criterios de anticoagulacao em pacientes criticos. 4. Elaborar analise de Ishikawa para complicacoes de CVC.')
  RETURNING id INTO cen4_3;

  -- TURMA 5 - OBSTETRICIA
  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof5,
    'Hemorragia Pos-Parto com Atonia Uterina e Choque Hipovolemico',
    'Mulher, 28 anos, G3P2, 39 semanas. Parto vaginal eutocico com neonato de 4.200g. Apos dequitacao: atonia uterina com hemorragia intensa (perda estimada 1.400 mL). Recebeu ocitocina 30 UI IV, misoprostol 800 mcg retal e ergometrina IM. Necessitou de bimanual, revisao de cavidade e transfusao de 2 CH. PA chegou a 70x40 mmHg.',
    '1. Identificar os gatilhos P4 (perda sanguinea >500 mL no parto vaginal) e P6 (uso de ocitocina >20 UI no pos-parto). 2. Discutir o protocolo de manejo da HPP baseado em evidencias. 3. Analisar fatores de risco para atonia uterina e estrategias preventivas. 4. Aplicar o ciclo PDCA para implementar protocolo institucional de HPP.')
  RETURNING id INTO cen5_1;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof5,
    'Laceracao Obstetrica de 4 Grau e Complicacoes do Puerperio',
    'Mulher, 22 anos, primipara, expulsivo de 90 minutos. Neonato 3.950g nasceu com manobra de McRoberts por distocia de ombros. Ocorreu laceracao esfincteriana completa de 4 grau. Suturas realizadas na sala de parto. No puerperio imediato: infeccao de ferida perineal com deiscencia parcial.',
    '1. Reconhecer o gatilho P2 (laceracao perineal de 3 ou 4 grau). 2. Discutir tecnicas de protecao perineal e indicacoes corretas de episiotomia. 3. Avaliar o manejo da distocia de ombros e prevencao de trauma perineal grave. 4. Propor plano de melhoria de qualidade para rastreio de laceracoes perineais.')
  RETURNING id INTO cen5_2;

  INSERT INTO cenarios_clinicos (professor_criador_id, titulo, descricao_pedagogica, objetivos_aprendizagem)
  VALUES (prof5,
    'Parto Instrumentalizado com Trauma Neonatal e Complicacoes Maternas',
    'Mulher, 34 anos, G2P1, variedade occipito-posterior persistente com segundo estagio prolongado (>3h). Indicado forceps de alivio. Durante aplicacao: laceracao vaginal extensa bilateral e hematoma retroperitoneal. Neonata com cefalohematoma. Plaquetopenia materna (68.000/mm3) nao comunicada a equipe do parto.',
    '1. Identificar os gatilhos P7 (parto instrumentalizado com trauma materno) e P3 (plaquetopenia <50.000/mm3 periparto). 2. Discutir indicacoes e complicacoes do parto instrumentalizado. 3. Avaliar a importancia da comunicacao de resultados laboratoriais criticos. 4. Elaborar analise de Ishikawa para a falha de comunicacao da plaquetopenia.')
  RETURNING id INTO cen5_3;

  -- =========================================================================
  -- 5. PRONTUARIOS SIMULADOS (45 Prontuarios - 3 por Cenario)
  -- =========================================================================

  -- TURMA 1 - CENARIO 1 (Clinica Medica: C. difficile e Anticoagulacao)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1_1, uh_cmed, 'ATD-2025-001', 67, '2025-03-10', '2025-03-31', 21,
    'Pneumonia resolvida. Alta com antibiotico oral. Retorno ambulatorial em 15 dias.',
    'Ceftriaxona 1g IV 12/12h (10d). Varfarina 5mg/dia. Metformina 850mg. Atorvastatina 40mg. Omeprazol 20mg.',
    'Leucocitos 18200. Hb 10,8. PCR 184. INR 7,2. Creatinina 1,2. Pesquisa Toxina C.difficile: POSITIVO.',
    NULL, 'Dia 1: febre 38,9C, estertores. Dia 8: diarreia aquosa volumosa. Dia 9: hematuria. Dia 12: transferencia. Alta dia 21.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1_1, uh_cmed, 'ATD-2025-002', 71, '2025-03-15', '2025-04-08', 24,
    'Pneumonia bilateral com bacteremia por MRSA. Alta com oximetria ambulatorial.',
    'Vancomicina 1g IV 12/12h. Piperacilina/tazobactam 4,5g IV 6/6h. Varfarina 4mg. Furosemida 40mg.',
    'Hemocultura 2/2 positiva: MRSA. Vancocinemia pico 32. INR 7,8. Leucocitos 22400. PCT 18,4.',
    NULL, 'Internacao prolongada por bacteremia por MRSA. INR supraterapeutico com sangramento oral. Alta apos 24 dias.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1_1, uh_cmed, 'ATD-2025-003', 62, '2025-04-01', '2025-04-18', 17,
    'DPOC exacerbado com pneumonia. Alta com oxigenio domiciliar.',
    'Metilprednisolona 125mg IV/dia. Salbutamol nebulizacao 4/4h. Levofloxacino 500mg IV/dia 7 dias.',
    'Escarro: cocos gram+. RX: infiltrado bilobar. Leucocitos 14800. SpO2 82% em ar ambiente.',
    NULL, 'Hipoxemia grave na admissao. Melhora progressiva. Alta com VNI noturna domiciliar.');

  -- TURMA 1 - CENARIO 2 (Clinica Medica: Quedas e Lesao por Pressao)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1_2, uh_cmed, 'ATD-2025-011', 78, '2025-02-10', '2025-03-05', 23,
    'ICC descompensada com queda e fratura de radio. Alta com cardiologista.',
    'Furosemida 80mg IV 12/12h. Enalapril 10mg. Carvedilol 12,5mg. Digoxina 0,125mg. Heparina 5000UI SC 8/8h.',
    'BNP 1890. Creatinina 1,4. Sodio 132. ECO: FE 28%. Radiografia punho D: fratura radio distal.',
    NULL, 'Admissao por dispneia. Queda no D5 (desorientacao). LPP sacral estagio III detectada no D8. Alta no D23.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1_2, uh_cmed, 'ATD-2025-012', 82, '2025-02-18', '2025-03-10', 20,
    'AVC isquemico com hemiplegia D. Fisioterapia iniciada. Alta para reabilitacao.',
    'AAS 100mg. Clopidogrel 75mg. Atorvastatina 80mg. Heparina de baixo peso 40mg SC.',
    'TC cranio: area hipodensa parietal esq. ECO: FA paroxistica. Glicemia 198. LDL 182.',
    NULL, 'AVC por FA nao anticoagulada. LPP calcaneos bilaterais estagio II no D7. Queda no D12. Fisioterapia intensificada.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1_2, uh_cmed, 'ATD-2025-013', 75, '2025-03-05', '2025-03-25', 20,
    'Pneumonia aspirativa em disfagico. Alta com dieta pastosa e fonoaudiologia.',
    'Ampicilina-sulbactam 3g IV 6/6h. Metronidazol 500mg IV 8/8h. Omeprazol 40mg IV.',
    'RX: condensacao bibasal D>E. PCR 210. Leucocitos 17600. SpO2 90%.',
    NULL, 'Aspiracao por disfagia pos-AVC. LPP sacro estagio II no D6. Queda no banheiro no D14 sem lesao ossea.');

  -- TURMA 1 - CENARIO 3 (Clinica Medica: Readmissao e Transferencia UTI)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1_3, uh_cmed, 'ATD-2025-021', 54, '2025-01-20', '2025-02-10', 21,
    'DPOC grave com readmissao por sepse. Transferido para UTI. Alta apos 21 dias.',
    'Ceftriaxona 2g IV. Metilprednisolona 40mg IV 8/8h. Salbutamol continuo. Noradrenalina 0,15 mcg/kg/min (UTI).',
    'Hemocultura 2/2: S. aureus. Hb: admissao 13,2 para 7,1 g/dL. PCT 22. SpO2 78%.',
    'IOT. VCV: VC 430mL, PEEP 8, FiO2 0,7.',
    'Readmissao em 12 dias. Deterioracao em <2h no PS. IOT emergencia. Bacteremia S.aureus. Queda Hb >35%. Alta apos 21 dias.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1_3, uh_cmed, 'ATD-2025-022', 48, '2025-02-05', '2025-02-28', 23,
    'Insuficiencia respiratoria aguda em pos-operatorio. Alta com acompanhamento pneumologico.',
    'Piperacilina/tazobactam 4,5g IV 6/6h. Vancomicina 1g IV 12/12h. Midazolam 0,05mg/kg/h. Fentanil 25mcg/h.',
    'Aspirado traqueal: Klebsiella pneumoniae ESBL+. RX: SDRA bilateral. PaO2/FiO2 118.',
    NULL, 'Readmissao em 18 dias com SDRA. Transferencia imediata para UTI. Hemocultura positiva no D3. Alta no D23.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen1_3, uh_cmed, 'ATD-2025-023', 60, '2025-03-01', '2025-03-25', 24,
    'Pneumonia grave com choque septico. Alta com oxigenoterapia domiciliar.',
    'Meropenem 2g IV 8/8h. Colistina 9 MUI IV. Vasopressina 0,03 UI/min. Hidrocortisona 50mg IV 6/6h.',
    'Hemocultura: A.baumannii XDR. Leucocitos 28400. PCT 22. Lactato 4,2. Creatinina pico 3,2.',
    'VM: PCV, PEEP 12, FiO2 0,9. Vasopressor por 6 dias.',
    'Choque septico por A.baumannii. UTI por 16 dias. Readmissao no D9 de enfermaria. Alta definitiva no D24.');

  -- TURMA 2 - CENARIO 1 (Farmacologia: Opioides e Naloxona na URPA)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2_1, uh_urpa, 'ATD-2025-031', 45, '2025-04-05', '2025-04-07', 2,
    'Pos-operatorio de colecistectomia laparoscopica sem complicacoes definitivas. Alta no D2.',
    'Morfina 8mg IV (unica dose). Naloxona 0,4mg IV. Metoclopramida 10mg IV 8/8h. Cetorolaco 30mg IV.',
    'SpO2 pos-morfina: 82%. FR: 6 irpm. ECG normal. Albumina 3,2.',
    NULL, 'Depressao respiratoria 90min apos morfina. Naloxona reverteu em 5min. Nauseas por 4h. Alta no D2.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2_1, uh_urpa, 'ATD-2025-032', 38, '2025-04-12', '2025-04-15', 3,
    'Herniorrafia umbilical sem complicacoes definitivas. Alta no D3.',
    'Tramadol 100mg IV 8/8h. Naloxona 0,2mg IV. Ondansetrona 4mg IV 8/8h. Dipirona 2g IV.',
    'SpO2 minima: 88%. FR: 8 irpm. Glasgow 11/15 no episodio. Hb 12,4.',
    NULL, 'Sedacao excessiva por tramadol 2h apos cirurgia. Naloxona com reversao parcial. Alta no D3.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2_1, uh_urpa, 'ATD-2025-033', 52, '2025-04-20', '2025-04-24', 4,
    'Gastrectomia laparoscopica por tumor GIST. Recuperacao com nauseas prolongadas. Alta no D4.',
    'Fentanil 150 mcg intraoperatorio. Morfina PCA 1mg/dose. Ondansetrona 8mg IV 8/8h. Dexametasona 8mg IV.',
    'SpO2 pos-anestesia: 91%, FR 9 irpm, 3h pos-op. Enzimas hepaticas normais.',
    NULL, 'Uso de PCA com morfina. Hipoventilacao no D1. Antiemeticos por 36h por nauseas refratarias. Alta no D4.');

  -- TURMA 2 - CENARIO 2 (Farmacologia: Hipoglicemia por Insulina)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2_2, uh_cmed, 'ATD-2025-041', 61, '2025-05-01', '2025-05-14', 13,
    'Celulite MID. DM2 descompensado. Alta com curativo ambulatorial e ajuste de insulina.',
    'Insulina NPH 30UI SC manha. Insulina Regular por escala. Cefazolina 2g IV 8/8h.',
    'Glicemia critica: 34 mg/dL (D3, 6h). Glicemias seriadas: 98, 142, 178, 34, 312 mg/dL. HbA1c 11,2%.',
    NULL, 'Hipoglicemia grave no D3. Reducao de ingesta nao comunicada. Revertida com glicose 50% IV. Alta com glicemias 100-180 mg/dL.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2_2, uh_cmed, 'ATD-2025-042', 55, '2025-05-08', '2025-05-20', 12,
    'Pielonefrite aguda em diabetico. Insulinoterapia intensiva. Alta com dieta orientada.',
    'Insulina Glargina 18UI SC noite. Insulina Lispro 4-8UI refeicoes. Ciprofloxacino 400mg IV 12/12h.',
    'Glicemia critica: 38 mg/dL (D4, 10h). Hb 11,8. HbA1c 9,8%.',
    NULL, 'Hipoglicemia no D4. Detectada pelo enfermeiro na verificacao de rotina. Ajuste do esquema basal-bolus.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2_2, uh_cmed, 'ATD-2025-043', 68, '2025-05-15', '2025-05-30', 15,
    'AVC isquemico em DM2. Controle glicemico ajustado. Alta para reabilitacao.',
    'Insulina Regular IV continua (protocolo intensivo). Heparina 5000UI SC 8/8h. AAS 200mg.',
    'Glicemia critica D2: 41 mg/dL. 80 afericoes: media 168, minima 41, maxima 302 mg/dL.',
    NULL, 'Protocolo insulina IV intensivo por AVC. Hipoglicemia grave no D2. Revisao do protocolo de insulina hospitalar iniciada.');

  -- TURMA 2 - CENARIO 3 (Farmacologia: Nefrotoxicidade e Reconciliacao)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2_3, uh_cmed, 'ATD-2025-051', 58, '2025-06-01', '2025-06-25', 24,
    'Pielonefrite complicada com IRA por aminoglicosideo. Dialise realizada. Alta com funcao renal parcialmente recuperada.',
    'Gentamicina 240mg IV/dia (10 dias sem monitorizacao). Enalapril 10mg VO (suspenso abruptamente D7). Furosemida 80mg IV.',
    'Creatinina basal 0,9 para pico 3,8 mg/dL. Gentamicina nivel vale: 4,1 (alto). Ureia 128. Cl creatinina estimado: 14 mL/min.',
    NULL, 'Nefrotoxicidade por gentamicina sem monitorizacao. Suspensao abrupta de enalapril gerou crise hipertensiva. Dialise urgencia 4 sessoes. Creatinina 1,9 na alta.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2_3, uh_cmed, 'ATD-2025-052', 63, '2025-06-10', '2025-07-01', 21,
    'Sepse urinaria. IRA por vancomicina. Alta com seguimento em nefrologia.',
    'Vancomicina 1g IV 12/12h (14 dias). Meropenem 1g IV 8/8h. Dialise 3 sessoes.',
    'Creatinina basal 1,1 para pico 4,2. Vancocinemia: 32 (toxica >20). Ureia 142.',
    NULL, 'Toxicidade renal por vancomicina sem ajuste ao peso e funcao renal. Dialise necessaria. Seguimento nefrologico agendado.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen2_3, uh_cmed, 'ATD-2025-053', 50, '2025-06-20', '2025-07-10', 20,
    'Infeccao urinaria em transplantada renal. Imunossupressao manejada com cuidado. Alta estavel.',
    'Imipenem 500mg IV 6/6h. Tacrolimus 4mg VO 12/12h. Prednisolona 20mg VO/dia.',
    'Creatinina basal 1,4 para pico 2,9. Tacrolimus nivel vale: 18 (toxico). Hemocultura: E.coli ESBL+.',
    NULL, 'Nefrotoxicidade por tacrolimus em dose elevada. Ajuste com farmaceutico clinico. Creatinina estabilizou em 1,8 na alta.');

  -- TURMA 3 - CENARIO 1 (Cirurgia Geral: Reintervencao e Hemorragia)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3_1, uh_ccir, 'ATD-2025-061', 32, '2025-03-15', '2025-03-25', 10,
    'Apendicectomia com reintervencao por hemorragia. Boa evolucao. Alta no D10.',
    'Cefazolina 2g IV pre-operatorio. Metronidazol 500mg IV 8/8h 3 dias. Tramadol 50mg IV SOS. 4 CH transfundidos.',
    'Hb pre-reintervencao: 7,1. Hb D1: 13,2 para 7,1 em 6h. PA: 80x50 mmHg.',
    'Laparoscopia. Reintervencao laparotomia: hemoperitonio 1200mL. Coto apendicular religado.',
    'Hemoperitonio por coto apendicular no D1. Reintervencao urgencia. Transfusao 4 CH. Alta no D10.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3_1, uh_ccir, 'ATD-2025-062', 28, '2025-04-01', '2025-04-12', 11,
    'Laparotomia por apendicite perfurada. Alta com antibioticoterapia oral.',
    'Ceftriaxona 2g IV. Metronidazol 500mg IV 8/8h. Morfina 4mg IV SOS. 2 CH.',
    'Hb: 8,2. TC: apendicite perfurada com abscesso pericecal. Leucocitos 22000.',
    'Laparotomia: lavagem exaustiva. Dreno penrose.',
    'Perfuracao apendicular com abscesso. Sem reintervencao mas necessitou transfusao. Alta no D11.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3_1, uh_ccir, 'ATD-2025-063', 41, '2025-04-15', '2025-04-27', 12,
    'Sigmoidectomia por diverticulite complicada com reintervencao por deiscencia anastomotica.',
    'Piperacilina/tazobactam 4,5g IV 6/6h. Metronidazol 500mg IV. Morfina PCA. 3 CH.',
    'Hb: 12,1 para 8,4. Leucocitos 19800. TC D4 pos-op: pneumoperitonio livre.',
    'Reintervencao D4: deiscencia anastomotica 2cm. Colostomia de protecao.',
    'Deiscencia anastomotica no D4 por peritonite fecal localizada. Reintervencao com colostomia temporaria. Alta no D12.');

  -- TURMA 3 - CENARIO 2 (Cirurgia Geral: Infeccao de Sitio Cirurgico)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3_2, uh_ccir, 'ATD-2025-071', 55, '2025-02-10', '2025-03-17', 35,
    'Gastrectomia subtotal com ISC por Klebsiella ESBL. Alta apos debridamento e antibioticoterapia longa.',
    'Piperacilina/tazobactam 4,5g IV 6/6h. Ertapenem 1g IV (ajuste por ESBL). Morfina PCA.',
    'Cultura ferida: Klebsiella pneumoniae ESBL+. Leucocitos pico 24600. PCR 320. Albumina 2,1.',
    'Gastrectomia subtotal laparoscopica.',
    'ISC profunda no D7. Debridamento cirurgico. Antibioticoterapia 21 dias. Alta no D35 com ferida cicatrizando por 2a intencao.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3_2, uh_ccir, 'ATD-2025-072', 48, '2025-02-20', '2025-03-20', 28,
    'Colectomia D por neoplasia de colon com ISC por E.coli. Alta com curativos ambulatoriais.',
    'Cefazolina 2g IV pre-op. Metronidazol 500mg IV. Ertapenem 1g IV/dia (14 dias).',
    'Cultura: E.coli ESBL+. Leucocitos 21400. Albumina 2,4.',
    'Colectomia direita laparoscopica. Anastomose ileo-colica mecanica.',
    'ISC superficial no D8. Ferida aberta e irrigada. Resolucao no D28.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3_2, uh_ccir, 'ATD-2025-073', 62, '2025-03-05', '2025-04-02', 28,
    'Herniorrafia com tela e ISC por MRSA. Alta apos tratamento cirurgico e antibiotico.',
    'Vancomicina 1g IV 12/12h (21 dias). Linezolida 600mg VO. Diclofenaco VO.',
    'MRSA na cultura da tela explantada. Leucocitos pico 18600. Vancocinemia 18 (adequada).',
    'Herniorrafia com tela polipropileno. Retirada tela infectada no D14.',
    'ISC com infeccao de protese por MRSA. Retirada tela D14. Vancomicina 21 dias. Reparo em 6 meses.');

  -- TURMA 3 - CENARIO 3 (Cirurgia Geral: Admissao em UTI e Falha de Extubacao)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3_3, uh_utia, 'ATD-2025-081', 48, '2025-01-20', '2025-02-08', 19,
    'Herniorrafia com complicacao respiratoria. PAV por P.aeruginosa. Alta com espirometria programada.',
    'Piperacilina/tazobactam 4,5g IV 6/6h. Amikacina 1g IV. Propofol 1-2mg/kg/h. Fentanil 25-100mcg/h.',
    'Cultura traqueal D4 UTI: P.aeruginosa sensivel. Leucocitos 20200. PaO2/FiO2 210.',
    'Herniorrafia inguinal bilateral. URPA: broncoespasmo. Reintubacao. UTI: VM 9 dias.',
    'Broncoespasmo grave. Reintubacao na URPA. PAV no D4 UTI. VM 9 dias. Alta hospitalar no D19.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3_3, uh_utia, 'ATD-2025-082', 35, '2025-02-01', '2025-02-18', 17,
    'Colecistectomia com broncoespasmo grave pos-operatorio. Alta apos UTI.',
    'Salbutamol nebulizacao continua. Hidrocortisona 200mg IV 8/8h. Vancomicina 1g IV 12/12h. Meropenem 2g IV 8/8h.',
    'SpO2 URPA minima: 74%. Broncoscopia: secrecao mucopurulenta bilateral. MRSA em escarro. Leucocitos 18400.',
    'Colecistectomia videolaparoscopica. Reintubacao na URPA.',
    'Broncoespasmo grave na URPA em paciente com asma nao controlada. PAV por MRSA no D5 UTI. VM 8 dias. Alta D17.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen3_3, uh_utia, 'ATD-2025-083', 55, '2025-02-15', '2025-03-10', 23,
    'Gastrectomia com insuficiencia respiratoria grave. Alta com oxigenoterapia domiciliar.',
    'Meropenem 2g IV 8/8h. Vancomicina 1g IV 12/12h. Noradrenalina SOS. Insulina IV.',
    'P.aeruginosa MDR no aspirado traqueal. RX D5: consolidacao bilateral. PaO2/FiO2 138.',
    'Gastrectomia total. VM preventiva. SDRA com PAV no D5.',
    'SDRA pos-operatoria com PAV por P.aeruginosa MDR. VM 14 dias. Traqueostomia D10. Alta com canula traqueostomia.');

  -- TURMA 4 - CENARIO 1 (Medicina Intensiva: PAV em UTI)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4_1, uh_utia, 'ATD-2025-091', 64, '2025-01-10', '2025-02-05', 26,
    'Sepse abdominal com PAV por P.aeruginosa MDR. Alta com reabilitacao respiratoria.',
    'Meropenem 2g IV 8/8h. Polimixina B 25000 UI/kg/dia. Noradrenalina 0,2 mcg/kg/min.',
    'BAL D6: P.aeruginosa MDR (sensivel somente a polimixina). Leucocitos 26000. SOFA 11.',
    'VM controlada: VC 6mL/kg, PEEP 12, FiO2 0,65. PAV no D6.',
    'Sepse abdominal. PAV no D6 por P.aeruginosa MDR. Alta da UTI no D20. Alta hospitalar D26 com O2 suplementar.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4_1, uh_utia, 'ATD-2025-092', 58, '2025-01-20', '2025-02-15', 26,
    'Pancreatite necrosante com PAV e multiplos procedimentos invasivos. Alta para reabilitacao.',
    'Imipenem 500mg IV 6/6h. Fluconazol 400mg IV/dia. Noradrenalina. Dexametasona 6mg IV/dia.',
    'BAL D7: MRSA. Hemocultura: Candida glabrata. PCT 28.',
    'Necrosectomia. VM prolongada. PAV no D7.',
    'Pancreatite necrosante grave. Candidemia por CVC. PAV por MRSA no D7. 26 dias UTI. Traqueostomia percutanea.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4_1, uh_utia, 'ATD-2025-093', 71, '2025-02-01', '2025-02-28', 27,
    'Politrauma grave com PAV e SDRA. Alta para reabilitacao motora.',
    'Piperacilina/tazobactam 4,5g IV 6/6h. Amikacina 1g. Vancomicina (adicionada D8 por MRSA).',
    'Cultura D5: P.aeruginosa. D8: MRSA adicional. PaO2/FiO2 inicial: 90. SOFA inicial: 14.',
    'VM protetora. Pronacao 16h/dia nos primeiros 5 dias.',
    'Politrauma. SDRA grave. PAV mista por P.aeruginosa e MRSA. VM 22 dias. Traqueostomia D10.');

  -- TURMA 4 - CENARIO 2 (Medicina Intensiva: Readmissao UTI e Reintubacao)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4_2, uh_utia, 'ATD-2025-101', 51, '2025-03-01', '2025-03-22', 21,
    'SDRA por COVID-19 com reintubacao apos falha de extubacao. Alta com oxigenoterapia domiciliar.',
    'Dexametasona 6mg IV/dia. Baricitinibe 4mg VO. Tocilizumabe 8mg/kg IV. VNI pre-reintubacao.',
    'IL-6: 1840. D-dimero: 4200. PaO2/FiO2 minimo: 68. RT-PCR COVID-19: positivo.',
    'Extubacao D14. Retorno UTI D1,5 pos-extubacao. Reintubacao urgencia.',
    'SDRA por COVID-19. Extubada apos 14 dias de VM. Readmissao UTI em 36h por IRA severa e ICU-AW. VM mais 7 dias.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4_2, uh_utia, 'ATD-2025-102', 44, '2025-03-10', '2025-03-28', 18,
    'Sepse meningococica com falha de extubacao e readmissao UTI. Alta sem sequelas aparentes.',
    'Ceftriaxona 4g IV 12/12h. Dexametasona 10mg IV 6/6h. Noradrenalina 0,08 mcg/kg/min.',
    'LCR: diplococos gram-negativos. CK: 8400 (rabdomiolise). Creatinina: 2,1.',
    'VM invasiva. Extubacao D10. Readmissao D11 por broncoaspiracao macica.',
    'Meningococcemia. VM 10 dias. Broncoaspiracao no D1 de enfermaria. Readmissao UTI urgencia. Alta sem deficit neurologico.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4_2, uh_utia, 'ATD-2025-103', 67, '2025-03-20', '2025-04-10', 21,
    'IRA em DPOC com falha de VNI e reintubacao. Traqueostomia. Alta para subintensivo.',
    'Salbutamol 5mg nebulizacao continua. Metilprednisolona 125mg IV 8/8h. Ceftriaxona 2g IV.',
    'pH 7,22. pCO2 78. pO2 48. Leucocitos 16400. Escarro: Klebsiella pneumoniae.',
    'VNI 12h pre-intubacao. IOT D2 por falha. Extubacao D12. Reintubacao D13. Traqueostomia D16.',
    'Exacerbacao grave DPOC. VNI falhou. IOT. Extubacao tentada D12. Reintubacao D13. Traqueostomia D16. Alta subintensiva D21.');

  -- TURMA 4 - CENARIO 3 (Medicina Intensiva: CVC e Hemorragia Digestiva Alta)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4_3, uh_utia, 'ATD-2025-111', 72, '2025-04-01', '2025-04-22', 21,
    'Choque septico com pneumotorax iatrogenico e HDA por ulcera de estresse. Alta com seguimento.',
    'Noradrenalina 0,15 mcg/kg/min. Heparina nao fracionada 1000 UI/h IV. Omeprazol 40mg IV 12/12h. Vitamina K 10mg IV.',
    'TTPa: 120 seg. Hb pos-HDA: 7,2. 3 CH transfundidos. RX pos-CVC: pneumotorax D 30%. Drenagem pleural.',
    'CVC subclavia E: pneumotorax iatrogenico D. VEDA: ulcera duodenal Forrest Ia. Esclerose+adrenalina.',
    'Pneumotorax iatrogenico na insercao de CVC. HDA no D3 por ulcera de estresse em uso de heparina. Endoscopia com hemostasia. Alta com IBP.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4_3, uh_utia, 'ATD-2025-112', 65, '2025-04-10', '2025-04-30', 20,
    'Sepse com HDA por heparina e complicacao de CVC. Alta estabilizada.',
    'Heparina 25000 UI/dia. Vancomicina 1g IV 12/12h. Piperacilina/tazobactam 4,5g IV. Omeprazol 40mg IV.',
    'TTPa: 140 seg. INR: 2,8. Hb: 9,1 para 6,8. Cultura CVC: MRSA. Plaquetopenia: 42000.',
    'CVC jugular D: trombose local. Retirada no D5. CVC femoral instalado.',
    'HDA grave com TTPa supraterapeutico. Trombose de CVC. Bacteremia por MRSA via cateter. 3 CH. 20 dias UTI.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen4_3, uh_utia, 'ATD-2025-113', 59, '2025-04-15', '2025-05-05', 20,
    'Peritonite com choque septico. HDA por estresse. Complicacoes de CVC. Alta com cirurgia agendada.',
    'Meropenem 2g IV 8/8h. Metronidazol 500mg IV. Omeprazol 80mg IV ataque. Heparina 5000UI SC 8/8h. 4 CH.',
    'TTPa: 115 seg. Hb: 11,2 para 7,4. Albumina: 1,8. Cultura CVC: Enterococcus faecalis.',
    'Laparotomia. CVC subclavia D: hemotorax. Drenagem toracoscopica.',
    'Peritonite fecal por diverticulite perfurada. Hemotorax iatrogenico no CVC. HDA no D4. 4 CH. Endoscopia com hemostasia. 20 dias UTI.');

  -- TURMA 5 - CENARIO 1 (Obstetricia: Hemorragia Pos-Parto e Atonia Uterina)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5_1, uh_mat, 'ATD-2025-121', 28, '2025-05-05', '2025-05-08', 3,
    'G3P2, atonia uterina com HPP grave. Estabilizada. Alta no D3.',
    'Ocitocina 30 UI IV. Misoprostol 800 mcg retal. Ergometrina 0,2mg IM. 2 CH. Acido tranexamico 1g IV.',
    'Hb pos-parto: 7,8. Perda estimada: 1400 mL. PA minima: 70x40 mmHg. FC maxima: 140 bpm.',
    NULL, 'Atonia uterina pos-dequitacao. Uterotonicos triplos + bimanual. Revisao de cavidade. 2 CH. Alta D3.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5_1, uh_mat, 'ATD-2025-122', 31, '2025-05-12', '2025-05-16', 4,
    'G1P0, HPP pos-cesarrea por atonia. Necessitou Balao de Bakri. Alta no D4.',
    'Ocitocina 20UI IV + 20UI em soro. Misoprostol 600 mcg. Balao de Bakri 500mL. 3 CH + 2 PFC. Acido tranexamico 2g.',
    'Hb pos-op: 6,4. Fibrinogenio: 180. TP: 18 seg. Perda intraoperatoria: 2100 mL.',
    'Cesarrea iterativa por placenta previa marginal. Atonia intraoperatoria.',
    'HPP por atonia pos-cesarrea em placenta previa. Balao de Bakri por 18h. Transfusao macica. Alta D4.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5_1, uh_mat, 'ATD-2025-123', 24, '2025-05-20', '2025-05-24', 4,
    'Primipara com HPP moderada. Curetagem uterina realizada. Alta estavel.',
    'Ocitocina 25 UI IV. Misoprostol 400 mcg sublingual. 2 CH. Acido tranexamico 1g IV.',
    'Hb pos-parto: 8,2. Perda estimada: 900 mL. PA estavel. Curetagem: restos placentarios.',
    NULL, 'Retencao de restos placentarios. Curetagem uterina sob antibiotico profilatico. 2 CH. Alta D4 com Hb 9,2.');

  -- TURMA 5 - CENARIO 2 (Obstetricia: Laceracoes Perineais Graves)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5_2, uh_mat, 'ATD-2025-131', 22, '2025-06-01', '2025-06-07', 6,
    'Primipara, laceracao esfincteriana 4 grau. Sutura em sala de parto. Alta com fisioterapia pelvica.',
    'Cefazolina 1g IV pre-sutura. Metronidazol 500mg IV 8/8h (5 dias). Dipirona 2g VO. Lactulose 15mL 12/12h.',
    'Perda estimada: 400 mL. Hb pos-parto: 9,8. Cultura ferida D5: S.aureus sensivel.',
    NULL, 'Laceracao completa esfincter externo e mucosa retal. Reparo primario por coloproctologista. Deiscencia parcial no D5. Alta D6.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5_2, uh_mat, 'ATD-2025-132', 25, '2025-06-10', '2025-06-17', 7,
    'G2P1, laceracao 3 grau em parto precipitado. Alta com acompanhamento ambulatorial.',
    'Cefazolina 1g IV. Metronidazol 500mg IV 8/8h 5 dias. Diclofenaco 50mg VO 8/8h.',
    'Hb pos-parto: 10,2. Perda: 450 mL. Avaliacao coloproctologica: esfincter interno preservado.',
    NULL, 'Laceracao 3 grau em parto precipitado (expulsivo 18min). Sutura primaria. Alta D7 com fisioterapia pelvica ambulatorial.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5_2, uh_mat, 'ATD-2025-133', 19, '2025-06-20', '2025-06-27', 7,
    'Adolescente primigesta, laceracao 4 grau em macrossomia. Reparo cirurgico. Alta com curativo.',
    'Cefazolina 2g IV. Metronidazol 500mg IV 8/8h. Morfina 4mg IV SOS. Lactulose 30mL/dia.',
    'Neonato 4500g. Perda: 520 mL. Hb: 8,8. Laceracao ate mucosa retal confirmada por exame digital.',
    NULL, 'Macrossomia fetal em adolescente primigesta. Laceracao 4 grau. Reparo em bloco cirurgico. Antibiotico 7 dias. Alta D7.');

  -- TURMA 5 - CENARIO 3 (Obstetricia: Parto Instrumentalizado)
  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5_3, uh_mat, 'ATD-2025-141', 34, '2025-07-01', '2025-07-06', 5,
    'G2P1, forceps por variedade OP persistente. Hematoma retroperitoneal. Alta apos reabsorcao.',
    'Cefazolina 1g IV. Dipirona 2g IV 6/6h. Morfina 4mg IV SOS. Heparina 5000UI SC 8/8h.',
    'Plaquetas admissao: 68000. Hb pos-parto: 9,4. USG: hematoma retroperitoneal 4x6 cm. Coagulograma normal.',
    'Forceps Simpson OP para OA. Hematoma retroperitoneal nas primeiras 4h.',
    'Plaquetopenia nao comunicada a equipe do parto. Forceps com trauma vaginal e hematoma retroperitoneal. Conduta conservadora. Alta D5.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5_3, uh_mat, 'ATD-2025-142', 29, '2025-07-08', '2025-07-13', 5,
    'G1P0, vacuo-extrator por sofrimento fetal agudo. Trauma perineal materno extenso.',
    'Cefazolina 1g IV. Ocitocina 10UI IM pos-parto. Dipirona 2g VO. Ibuprofeno 400mg VO.',
    'Hb pos-parto: 10,4. Cefalohematoma neonatal: presente. Laceracao vaginal bilateral grau 2.',
    'Vacuo-extrator Kiwi OmniCup. 2 tracoes. Apgar 5/8/9.',
    'Sofrimento fetal agudo com indicacao de parto imediato. Vacuo-extrator. Trauma perineal bilateral suturado. Alta D5.');

  INSERT INTO prontuarios_simulados VALUES (DEFAULT, cen5_3, uh_mat, 'ATD-2025-143', 37, '2025-07-15', '2025-07-22', 7,
    'G3P2, forceps de alivio com laceracoes multiplas. Alta com fisioterapia pelvica.',
    'Cefazolina 2g IV. Metronidazol 500mg IV 3 dias. Morfina 2mg IV SOS.',
    'Plaquetas: 74000. Hb pos-parto: 8,6. Perda: 750 mL. Coagulograma normal.',
    'Forceps de alivio OA. Laceracoes grau 2 bilateral + episiorrafia.',
    'Segundo estagio prolongado >3h. Forceps com laceracoes multiplas. Perda >500mL. Plaquetopenia nao relatada na admissao. Alta D7.');

  -- =========================================================================
  -- 6. ATIVIDADES DE AUDITORIA (15 Atividades - 3 por Turma)
  -- =========================================================================
  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma1, cen1_1, 'Atividade 01 - Infeccao Hospitalar e Anticoagulacao', '2025-04-10 08:00:00', '2025-04-17 23:59:00', 25, TRUE) RETURNING id INTO atv1_1;
  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma1, cen1_2, 'Atividade 02 - Queda e Lesao por Pressao em Idoso', '2025-05-08 08:00:00', '2025-05-15 23:59:00', 25, TRUE) RETURNING id INTO atv1_2;
  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma1, cen1_3, 'Atividade 03 - Readmissao e Transferencia para UTI', '2025-06-05 08:00:00', '2025-06-12 23:59:00', 25, TRUE) RETURNING id INTO atv1_3;

  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma2, cen2_1, 'Atividade 01 - Depressao Respiratoria por Opioide', '2025-04-15 08:00:00', '2025-04-22 23:59:00', 25, TRUE) RETURNING id INTO atv2_1;
  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma2, cen2_2, 'Atividade 02 - Hipoglicemia por Insulina Hospitalar', '2025-05-13 08:00:00', '2025-05-20 23:59:00', 25, TRUE) RETURNING id INTO atv2_2;
  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma2, cen2_3, 'Atividade 03 - Nefrotoxicidade e Reconciliacao Medicamentosa', '2025-06-10 08:00:00', '2025-06-17 23:59:00', 25, TRUE) RETURNING id INTO atv2_3;

  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma3, cen3_1, 'Atividade 01 - Reintervencao Cirurgica e Hemorragia', '2025-04-20 08:00:00', '2025-04-27 23:59:00', 25, TRUE) RETURNING id INTO atv3_1;
  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma3, cen3_2, 'Atividade 02 - Infeccao de Sitio Cirurgico', '2025-05-18 08:00:00', '2025-05-25 23:59:00', 25, TRUE) RETURNING id INTO atv3_2;
  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma3, cen3_3, 'Atividade 03 - Complicacoes Respiratorias Pos-operatorias', '2025-06-15 08:00:00', '2025-06-22 23:59:00', 25, TRUE) RETURNING id INTO atv3_3;

  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma4, cen4_1, 'Atividade 01 - PAV: Pneumonia Associada a Ventilacao', '2025-04-05 08:00:00', '2025-04-12 23:59:00', 25, TRUE) RETURNING id INTO atv4_1;
  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma4, cen4_2, 'Atividade 02 - Readmissao e Reintubacao em UTI', '2025-05-06 08:00:00', '2025-05-13 23:59:00', 25, TRUE) RETURNING id INTO atv4_2;
  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma4, cen4_3, 'Atividade 03 - Complicacoes de CVC e Hemorragia Digestiva', '2025-06-03 08:00:00', '2025-06-10 23:59:00', 25, TRUE) RETURNING id INTO atv4_3;

  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma5, cen5_1, 'Atividade 01 - Hemorragia Pos-Parto e Atonia Uterina', '2025-05-25 08:00:00', '2025-06-01 23:59:00', 25, TRUE) RETURNING id INTO atv5_1;
  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma5, cen5_2, 'Atividade 02 - Laceracoes Obstetricas Graves', '2025-06-22 08:00:00', '2025-06-29 23:59:00', 25, TRUE) RETURNING id INTO atv5_2;
  INSERT INTO atividades_auditoria (turma_id, cenario_id, titulo, data_inicio, data_fim, tempo_limite_minutos, finalizada)
  VALUES (turma5, cen5_3, 'Atividade 03 - Parto Instrumentalizado e Complicacoes', '2025-07-20 08:00:00', '2025-07-27 23:59:00', 25, TRUE) RETURNING id INTO atv5_3;

  -- =========================================================================
  -- 7. REVISOES INDIVIDUAIS, ACHADOS, VALIDACOES E MELHORIA DA QUALIDADE
  -- Iteracao: 5 Turmas x 50 Alunos x 3 Atividades x 3 Prontuarios = 2.250
  -- =========================================================================

  FOR v_turma_idx IN 1..5 LOOP

    CASE v_turma_idx
      WHEN 1 THEN turma_cur := turma1; prof_cur := prof1; atv_ids := ARRAY[atv1_1,atv1_2,atv1_3]; cen_ids := ARRAY[cen1_1,cen1_2,cen1_3];
      WHEN 2 THEN turma_cur := turma2; prof_cur := prof2; atv_ids := ARRAY[atv2_1,atv2_2,atv2_3]; cen_ids := ARRAY[cen2_1,cen2_2,cen2_3];
      WHEN 3 THEN turma_cur := turma3; prof_cur := prof3; atv_ids := ARRAY[atv3_1,atv3_2,atv3_3]; cen_ids := ARRAY[cen3_1,cen3_2,cen3_3];
      WHEN 4 THEN turma_cur := turma4; prof_cur := prof4; atv_ids := ARRAY[atv4_1,atv4_2,atv4_3]; cen_ids := ARRAY[cen4_1,cen4_2,cen4_3];
      WHEN 5 THEN turma_cur := turma5; prof_cur := prof5; atv_ids := ARRAY[atv5_1,atv5_2,atv5_3]; cen_ids := ARRAY[cen5_1,cen5_2,cen5_3];
    END CASE;

    SELECT ARRAY_AGG(ta.aluno_id ORDER BY ta.aluno_id) INTO aluno_ids FROM turma_alunos ta WHERE ta.turma_id = turma_cur;

    FOR v_aluno_idx IN 1..50 LOOP
      v_aluno_id := aluno_ids[v_aluno_idx];

      FOR v_atv_idx IN 1..3 LOOP

        SELECT ARRAY_AGG(p.id ORDER BY p.id) INTO pront_ids
        FROM prontuarios_simulados p WHERE p.cenario_id = cen_ids[v_atv_idx];

        FOR v_pront_idx IN 1..3 LOOP

          -- Hash deterministico pseudo-aleatorio baseado nos indices (1..100)
          v_hash := ((v_turma_idx * 7 + v_aluno_idx * 13 + v_atv_idx * 5 + v_pront_idx * 3) % 100) + 1;

          -- 88% finalizaram a auditoria
          v_finalizada := (v_hash <= 88);
          -- Tempo entre 8 e 25 minutos
          v_tempo := 480 + ((v_hash * 17 + v_aluno_idx * 7) % 1020);

          v_revisao_id := NULL;
          INSERT INTO revisoes_individuais (atividade_id, aluno_id, prontuario_id, tempo_gasto_segundos, finalizada, data_submissao)
          VALUES (atv_ids[v_atv_idx], v_aluno_id, pront_ids[v_pront_idx], v_tempo, v_finalizada,
            CASE WHEN v_finalizada THEN NOW() - (((v_aluno_idx + v_pront_idx) * 3)||' days')::interval ELSE NULL END)
          ON CONFLICT (atividade_id, aluno_id, prontuario_id) DO NOTHING
          RETURNING id INTO v_revisao_id;

          IF v_revisao_id IS NULL THEN
            SELECT ri.id INTO v_revisao_id FROM revisoes_individuais ri
            WHERE ri.atividade_id = atv_ids[v_atv_idx] AND ri.aluno_id = v_aluno_id AND ri.prontuario_id = pront_ids[v_pront_idx];
          END IF;

          CONTINUE WHEN v_revisao_id IS NULL;

          -- Apenas revisoes finalizadas geram achados e validacoes
          IF v_finalizada THEN

            -- ==============================================================
            -- ACHADOS DE GATILHOS (75% detectam gatilhos GTT)
            -- ==============================================================
            IF v_hash <= 75 THEN

              -- Gatilho primario conforme a especialidade clinica
              CASE v_turma_idx
                WHEN 1 THEN CASE v_atv_idx
                  WHEN 1 THEN gat := CASE v_pront_idx WHEN 1 THEN gat_m1 WHEN 2 THEN gat_m3 ELSE gat_c11 END;
                  WHEN 2 THEN gat := CASE v_pront_idx WHEN 1 THEN gat_c7 WHEN 2 THEN gat_c7 ELSE gat_c8 END;
                  WHEN 3 THEN gat := CASE v_pront_idx WHEN 1 THEN gat_c13 WHEN 2 THEN gat_c13 ELSE gat_c4 END;
                END CASE;
                WHEN 2 THEN CASE v_atv_idx
                  WHEN 1 THEN gat := CASE v_pront_idx WHEN 1 THEN gat_m9 WHEN 2 THEN gat_m9 ELSE gat_m10 END;
                  WHEN 2 THEN gat := gat_m4;
                  WHEN 3 THEN gat := CASE v_pront_idx WHEN 1 THEN gat_m5 WHEN 2 THEN gat_m5 ELSE gat_m12 END;
                END CASE;
                WHEN 3 THEN CASE v_atv_idx
                  WHEN 1 THEN gat := CASE v_pront_idx WHEN 1 THEN gat_s1 WHEN 2 THEN gat_c1 ELSE gat_s1 END;
                  WHEN 2 THEN gat := gat_s11;
                  WHEN 3 THEN gat := CASE v_pront_idx WHEN 1 THEN gat_s4 WHEN 2 THEN gat_s4 ELSE gat_s7 END;
                END CASE;
                WHEN 4 THEN CASE v_atv_idx
                  WHEN 1 THEN gat := gat_i1;
                  WHEN 2 THEN gat := CASE v_pront_idx WHEN 1 THEN gat_i2 WHEN 2 THEN gat_i2 ELSE gat_i4 END;
                  WHEN 3 THEN gat := CASE v_pront_idx WHEN 1 THEN gat_i3 WHEN 2 THEN gat_m2 ELSE gat_i3 END;
                END CASE;
                WHEN 5 THEN CASE v_atv_idx
                  WHEN 1 THEN gat := CASE v_pront_idx WHEN 1 THEN gat_p4 WHEN 2 THEN gat_p4 ELSE gat_p6 END;
                  WHEN 2 THEN gat := gat_p2;
                  WHEN 3 THEN gat := CASE v_pront_idx WHEN 1 THEN gat_p7 WHEN 2 THEN gat_p7 ELSE gat_p3 END;
                END CASE;
              END CASE;

              -- 65% confirmam dano assistencial; 15% classificam como presente na admissao
              v_confirma  := (v_hash <= 65);
              v_dano_adm  := (v_hash > 65 AND v_hash <= 80);

              -- Distribuicao equilibrada cobrindo todas as 5 categorias NCC-MERP para os graficos
              v_gravidade := CASE WHEN v_confirma THEN
                CASE ((v_hash * 3 + v_aluno_idx + v_turma_idx) % 20)
                  WHEN 0 THEN 'CATEGORIA_I'                                -- 5%
                  WHEN 1 THEN 'CATEGORIA_H' WHEN 2 THEN 'CATEGORIA_H'      -- 10%
                  WHEN 3 THEN 'CATEGORIA_G' WHEN 4 THEN 'CATEGORIA_G' WHEN 5 THEN 'CATEGORIA_G' -- 15%
                  WHEN 6 THEN 'CATEGORIA_F' WHEN 7 THEN 'CATEGORIA_F' WHEN 8 THEN 'CATEGORIA_F'
                  WHEN 9 THEN 'CATEGORIA_F' WHEN 10 THEN 'CATEGORIA_F' WHEN 11 THEN 'CATEGORIA_F' -- 30%
                  ELSE 'CATEGORIA_E'                                       -- 40%
                END ELSE NULL END;

              INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
              VALUES (
                v_revisao_id, gat,
                CASE v_turma_idx WHEN 1 THEN cat_infec WHEN 2 THEN cat_med WHEN 3 THEN cat_cirurg WHEN 4 THEN cat_infec ELSE cat_obstet END,
                v_confirma,
                CASE WHEN v_confirma THEN
                  'Evento adverso identificado durante a internacao hospitalar. Alteracoes clinicas e laboratoriais compativeis com o gatilho rastreado, com nexo causal estabelecido com o cuidado assistencial e sem relacao direta com o diagnostico previo de admissao.'
                ELSE
                  'Gatilho rastreado presente no prontuario, porem apos revisao detalhada das evolucoes e prescricoes, os achados sao consistentes com a evolucao natural da patologia de base do paciente, nao configurando evento adverso iatrogenico.'
                END,
                v_dano_adm, v_gravidade::gravidade_ncc_merp_enum);

              -- 40% dos que acham gatilho primario encontram um segundo gatilho no prontuario
              IF v_hash <= 40 THEN
                gat2 := CASE v_turma_idx
                  WHEN 1 THEN CASE v_atv_idx WHEN 1 THEN gat_c4 WHEN 2 THEN gat_c8 ELSE gat_c6 END
                  WHEN 2 THEN CASE v_atv_idx WHEN 1 THEN gat_m11 WHEN 2 THEN gat_m11 ELSE gat_m6 END
                  WHEN 3 THEN CASE v_atv_idx WHEN 1 THEN gat_c6 WHEN 2 THEN gat_c4 ELSE gat_s3 END
                  WHEN 4 THEN CASE v_atv_idx WHEN 1 THEN gat_c13 WHEN 2 THEN gat_c13 ELSE gat_c1 END
                  WHEN 5 THEN CASE v_atv_idx WHEN 1 THEN gat_c1 WHEN 2 THEN gat_c11 ELSE gat_p4 END
                END;
                v_confirma2 := (v_hash <= 25);
                v_grav2 := CASE WHEN v_confirma2 THEN
                  CASE ((v_hash + v_pront_idx) % 4) WHEN 0 THEN 'CATEGORIA_E' WHEN 1 THEN 'CATEGORIA_F' WHEN 2 THEN 'CATEGORIA_G' ELSE 'CATEGORIA_H' END
                ELSE NULL END;

                IF gat2 IS DISTINCT FROM gat THEN
                  INSERT INTO achados_gatilhos (revisao_individual_id, gatilho_id, categoria_ea_id, confirmou_dano, justificativa_dano, dano_presente_admissao, gravidade)
                  VALUES (
                    v_revisao_id, gat2,
                    CASE v_turma_idx WHEN 1 THEN cat_infec WHEN 2 THEN cat_med WHEN 3 THEN cat_cirurg WHEN 4 THEN cat_infec ELSE cat_obstet END,
                    v_confirma2,
                    CASE WHEN v_confirma2 THEN
                      'Segundo evento adverso identificado no mesmo prontuario. Analise criteriosa evidencia complicacao adicional que contribuiu para o tempo prolongado de internacao e necessidade de medidas de suporte.'
                    ELSE
                      'Gatilho secundario rastreado. Apos avaliacao do contexto clinico e cronologia assistencial, o evento foi atribuido a condicao cronica preexistente.'
                    END,
                    FALSE, v_grav2::gravidade_ncc_merp_enum);
                END IF;
              END IF;

            END IF; -- fim 75% gatilho

            -- ==============================================================
            -- VALIDACOES DOCENTES (85% das finalizadas sao avaliadas pelo professor)
            -- 70% homologadas (alimentam os graficos e indicadores IHI-GTT)
            -- ==============================================================
            IF v_hash <= 85 THEN
              v_homologado := (v_hash <= 70);

              INSERT INTO validacoes_docentes (revisao_individual_id, professor_validador_id, parecer_formativo, homologado, data_validacao)
              VALUES (
                v_revisao_id, prof_cur,
                CASE WHEN v_homologado THEN
                  CASE (v_hash % 4)
                    WHEN 0 THEN 'Excelente revisao. O academico identificou com precisao os gatilhos GTT presentes no prontuario e estabeleceu adequadamente o nexo causal com o dano assistencial. Justificativa clinica bem embasada e classificacao NCC-MERP correta.'
                    WHEN 1 THEN 'Revisao aprovada com louvor. Raciocinio epidemiologico solido na analise das prescricoes e exames laboratoriais. A correlacao temporal do evento adverso demonstra dominio da metodologia IHI Global Trigger Tool.'
                    WHEN 2 THEN 'Auditoria individual homologada. O aluno demonstrou capacidade analitica ao discriminar eventos adversos de complicacoes esperadas da doenca de base. Parabens pela profundidade da discussao clinica.'
                    WHEN 3 THEN 'Revisao satisfatoria e homologada. Identificacao correta dos gatilhos primarios e boa fundamentacao. Recomendo atencao redobrada aos gatilhos secundarios laboratoriais em casos de maior complexidade.'
                  END
                ELSE
                  CASE (v_hash % 3)
                    WHEN 0 THEN 'Revisao necessita de ajustes. O gatilho identificado e pertinente, porem a classificacao da gravidade pela NCC-MERP diverge dos criterios operacionais. Categoria E requer intervencao sem prolongamento de estadia.'
                    WHEN 1 THEN 'Revisao nao homologada. O evento apontado como dano assistencial ja estava documentado na admissao do paciente no PS. Releia os criterios de inclusao temporal do GTT e refaca a analise.'
                    WHEN 2 THEN 'Revisao reprovada. Ausencia de fundamentacao clinica conclusiva quanto ao nexo causal entre o medicamento prescrito e a alteracao laboratorial descrita. Favor revisar a literatura e ressubmeter.'
                  END
                END,
                v_homologado,
                NOW() - (((v_aluno_idx + v_atv_idx) * 2)||' days')::interval
              ) ON CONFLICT (revisao_individual_id) DO NOTHING;
            END IF;

            -- ==============================================================
            -- MELHORIA DA QUALIDADE (Ishikawa, 5W3H, PDCA em 60% das homologadas)
            -- ==============================================================
            IF v_hash <= 60 THEN

              -- ANALISE DE ISHIKAWA
              INSERT INTO analises_ishikawa (revisao_individual_id, efeito_principal, metodo, mao_de_obra, material, medida, meio_ambiente, maquina)
              VALUES (
                v_revisao_id,
                CASE v_turma_idx
                  WHEN 1 THEN CASE v_atv_idx WHEN 1 THEN 'Infeccao hospitalar por C. difficile em paciente anticoagulado' WHEN 2 THEN 'Queda com fratura e lesao por pressao em idoso hospitalizado' ELSE 'Readmissao precoce e deterioracao clinica com transferencia para UTI' END
                  WHEN 2 THEN CASE v_atv_idx WHEN 1 THEN 'Depressao respiratoria grave por opioide no pos-operatorio' WHEN 2 THEN 'Hipoglicemia grave por administracao de insulina hospitalar' ELSE 'Insuficiencia renal aguda por toxicidade medicamentosa de aminoglicosideo' END
                  WHEN 3 THEN CASE v_atv_idx WHEN 1 THEN 'Hemorragia pos-operatoria com retorno nao planejado ao centro cirurgico' WHEN 2 THEN 'Infeccao de sitio cirurgico profunda por germe multirresistente' ELSE 'Falha de extubacao na URPA e admissao nao programada em terapia intensiva' END
                  WHEN 4 THEN CASE v_atv_idx WHEN 1 THEN 'Pneumonia associada a ventilacao mecanica (PAV) em paciente critico' WHEN 2 THEN 'Falha de extubacao com broncoaspiracao e readmissao precoce em UTI' ELSE 'Pneumotorax iatrogenico em puncao de CVC associado a hemorragia digestiva' END
                  WHEN 5 THEN CASE v_atv_idx WHEN 1 THEN 'Hemorragia pos-parto grave decorrente de atonia uterina e choque hipovolemico' WHEN 2 THEN 'Laceracao obstetrica de 4 grau com infeccao e deiscencia puerperal' ELSE 'Trauma materno-fetal extenso decorrente de parto instrumentalizado com forceps' END
                END,
                CASE v_turma_idx
                  WHEN 1 THEN 'Ausencia de protocolo institucional de stewardship de antimicrobianos e monitorizacao de INR sem periodicidade sistematizada.'
                  WHEN 2 THEN 'Falta de escala padronizada de sedacao e analgesia (RASS) na URPA e ausencia de dupla checagem na administracao de insulina.'
                  WHEN 3 THEN 'Checklist de cirurgia segura incompleto e protocolo de vigilancia de sangramento nas primeiras 6h pos-op inexistente.'
                  WHEN 4 THEN 'Bundle de prevencao de PAV aplicado de forma assistematica e criterios de desmame ventilatorio nao padronizados.'
                  WHEN 5 THEN 'Manejo ativo do 3 estagio do parto nao sistematizado e ausencia de rotina para comunicacao de plaquetopenia no periparto.'
                END,
                CASE v_turma_idx
                  WHEN 1 THEN 'Sobrecarga de trabalho da equipe de enfermagem e comunicacao interprofissional tardia sobre valores criticos de coagulograma.'
                  WHEN 2 THEN 'Relacao enfermeiro-paciente desfavoravel na recuperacao pos-anestesica e desconhecimento do algoritmo de reversao por naloxona.'
                  WHEN 3 THEN 'Transicao de cuidados (handover) entre centro cirurgico e enfermaria realizada sem ferramenta estruturada (SBAR).'
                  WHEN 4 THEN 'Rotatividade de tecnicos de enfermagem na realizacao da higiene oral com clorexidina e interrupcao de sedacao nao realizada.'
                  WHEN 5 THEN 'Falta de treinamento periodico em simulacao realistica de hemorragia pos-parto e protecao perineal manual no periodo expulsivo.'
                END,
                CASE v_turma_idx
                  WHEN 1 THEN 'Testes rapidos para toxina de C. difficile indisponiveis no plantao noturno e atraso na entrega de fitomenadiona.'
                  WHEN 2 THEN 'Naloxona injetavel armazenada distante do leito do paciente na URPA e fitas de glicemia capilar com lote proximo ao vencimento.'
                  WHEN 3 THEN 'Fios de sutura hemostatica com disponibilidade irregular no bloco cirurgico e demora na liberacao de concentrado de hemacias.'
                  WHEN 4 THEN 'Camas hospitalares com mecanismo de angulacao da cabeceira danificado e falta temporaria de tubos com aspiracao subglotica.'
                  WHEN 5 THEN 'Kit de emergencia de hemorragia pos-parto (HPP) incompleto e ausencia de balanca de precisao para pesagem de compressas.'
                END,
                CASE v_turma_idx
                  WHEN 1 THEN 'Indicadores de uso de antimicrobianos e taxas de diarreia nosocomial nao monitorados sistematicamente na enfermaria.'
                  WHEN 2 THEN 'Frequencia de afericao de glicemia em jejum nao correlacionada com os horarios de distribuicao das dietas hospitalares.'
                  WHEN 3 THEN 'Tempo de resposta entre o diagnostico de sangramento ativo e o retorno ao centro cirurgico nao mensurado como meta de qualidade.'
                  WHEN 4 THEN 'Adesao ao bundle de prevencao de PAV aferida apenas mensalmente, sem retorno imediato em tempo real aos profissionais.'
                  WHEN 5 THEN 'Estimativa visual subjetiva de perda hematica no parto vaginal com erro de mensuracao frequentemente superior a 40%.'
                END,
                CASE v_turma_idx
                  WHEN 1 THEN 'Enfermaria com alta taxa de ocupacao dificultando o isolamento de contato imediato de pacientes sintomaticos respiratorios e digestivos.'
                  WHEN 2 THEN 'Nivel de ruido excessivo na URPA dificultando a audibilidade de alarmes de oximetria de pulso e capnografia.'
                  WHEN 3 THEN 'Centro cirurgico com fluxo inadequado de circulacao de profissionais durante intervencoes de emergencia nos finais de semana.'
                  WHEN 4 THEN 'Ambiente de UTI com alta pressao de selecao por germes multirresistentes e circulacao cruzada de dispositivos invasivos.'
                  WHEN 5 THEN 'Centro obstetrico com multiplos partos simultaneos sobrecarregando a equipe medica e de enfermagem obstetrica.'
                END,
                CASE v_turma_idx
                  WHEN 1 THEN 'Sistema de prescricao eletronica sem alertas bloqueadores para dosagens de varfarina com INR acima de 4,0.'
                  WHEN 2 THEN 'Monitores multiparametricos com limites de alarme de SpO2 desregulados e bombas de infusao de insulina sem tecnologia de limites seguros.'
                  WHEN 3 THEN 'Aparelho de ultrassonografia bedside indisponivel no pós-operatorio para avaliacao imediata de liquido livre na cavidade.'
                  WHEN 4 THEN 'Ventiladores mecanicos antigos sem modo inteligente de suporte e sensores de fluxo com necessidade de calibracao constante.'
                  WHEN 5 THEN 'Falta de sistema eletronico automatizado para notificacao instantanea de plaquetopenia critica a equipe da sala de parto.'
                END
              ) ON CONFLICT (revisao_individual_id) DO NOTHING;

              -- PLANO DE ACAO 5W3H
              INSERT INTO planos_acao_5w3h (revisao_individual_id, o_que, por_que, quem, onde, quando, como, quanto_custa, como_medir)
              VALUES (
                v_revisao_id,
                CASE v_turma_idx
                  WHEN 1 THEN CASE v_atv_idx WHEN 1 THEN 'Implementar protocolo de monitorizacao de INR e rastreio de C.difficile em uso de antibioticos' WHEN 2 THEN 'Implantar protocolo de avaliacao de risco de quedas e LPP com escalas Braden e Morse na admissao' ELSE 'Criar checklist multidisciplinar de alta segura com monitoramento telefonico pos-alta em 72h' END
                  WHEN 2 THEN CASE v_atv_idx WHEN 1 THEN 'Implantar protocolo de monitorizacao de oximetria e capnografia continua na administracao de opioides' WHEN 2 THEN 'Estabelecer protocolo de insulinoterapia hospitalar com dupla checagem obrigatoria antes da injecao' ELSE 'Criar rotina de conciliacao medicamentosa na admissao e monitorizacao de niveis sericos de nefrotoxicos' END
                  WHEN 3 THEN CASE v_atv_idx WHEN 1 THEN 'Instituir protocolo de vigilancia ativa de sinais de sangramento pos-operatorio nas primeiras 6h' WHEN 2 THEN 'Adotar bundle institucional de prevencao de infeccao de sitio cirurgico com banho de clorexidina' ELSE 'Padronizar criterios objetivos de prontidao para extubacao na URPA e escore de risco respiratorio' END
                  WHEN 4 THEN CASE v_atv_idx WHEN 1 THEN 'Implantar checklist diario do bundle de prevencao de PAV a beira do leito com auditoria do enfermeiro' WHEN 2 THEN 'Estabelecer criterios rigorosos de teste de respiracao espontanea (TRE) antes da desentubacao' ELSE 'Adotar bundle de puncao de CVC guiada por ultrassom e profilaxia de ulcera de estresse com IBP' END
                  WHEN 5 THEN CASE v_atv_idx WHEN 1 THEN 'Disponibilizar kit emergencial de HPP em todas as salas de parto e praticar manejo ativo do 3 estagio' WHEN 2 THEN 'Implantar tecnica padronizada de protecao perineal manual e exame genital sistematico pos-parto' ELSE 'Instituir rotina eletronica de dupla checagem de resultados laboratoriais criticos no pre-parto' END
                END,
                'Mitigar falhas sistemicas identificadas na revisao retrospectiva pelo IHI Global Trigger Tool, reduzindo danos graves evitaveis e tempo excessivo de internacao.',
                CASE v_turma_idx
                  WHEN 1 THEN 'Equipe de Clinica Medica, apoio da CCIH e farmacia clinica'
                  WHEN 2 THEN 'Anestesiologistas, enfermagem da URPA e farmacia clinica'
                  WHEN 3 THEN 'Cirurgioes responsaveis, enfermagem do CC e Nucleo de Seguranca'
                  WHEN 4 THEN 'Equipe multiprofissional da UTI: intensivistas e enfermagem'
                  WHEN 5 THEN 'Obstetras, enfermeiras obstetras e equipe da maternidade'
                END,
                CASE v_turma_idx
                  WHEN 1 THEN 'Enfermarias de Clinica Medica do HU-UFS - leitos de internacao'
                  WHEN 2 THEN 'Unidade de Recuperacao Pos-Anestesica (URPA) do HU-UFS'
                  WHEN 3 THEN 'Centro Cirurgico e Unidade de Cuidados Pos-Operatorios'
                  WHEN 4 THEN 'Unidade de Terapia Intensiva Adulto (UTI-A) do HU-UFS'
                  WHEN 5 THEN 'Centro Obstetrico e Maternidade do HU-UFS'
                END,
                CASE (v_hash % 3)
                  WHEN 0 THEN 'Implantacao em 30 dias, treinamento em 2 semanas e auditoria no 1 mes'
                  WHEN 1 THEN 'Inicio imediato apos aprovacao. Revisao em 90 dias com dados coletados'
                  WHEN 2 THEN 'Implementacao faseada: piloto em 15 dias, expansao geral em 60 dias'
                END,
                'Elaboracao de Procedimento Operacional Padrao (POP), treinamento com simulacao realistica para equipes assistenciais, afixacao de lembretes visuais a beira do leito e auditorias clinicas quinzenais.',
                CASE (v_hash % 4) WHEN 0 THEN 1200.00 WHEN 1 THEN 2500.00 WHEN 2 THEN 750.00 WHEN 3 THEN 3200.00 END,
                CASE (v_hash % 3)
                  WHEN 0 THEN 'Taxa de conformidade >=90% em auditoria mensal. Reducao de 50% no evento em 6 meses.'
                  WHEN 1 THEN 'Monitoramento mensal da taxa de evento adverso. Meta: reducao >=30% em 3 meses.'
                  WHEN 2 THEN 'Auditoria semanal com meta de adesao >85%. Relatorio bimestral a Comissao de Qualidade.'
                END
              );

              -- CICLO PDCA
              INSERT INTO ciclos_pdca (revisao_individual_id, planejar, fazer, checar, agir)
              VALUES (
                v_revisao_id,
                CASE v_turma_idx
                  WHEN 1 THEN 'PLAN: Reduzir a incidence de diarreia nosocomial e INR excessivo na Clinica Medica em 45% em 6 meses. Acoes planejadas: monitoramento semanal de INR, restricao de quinolonas e cefalosporinas de 3a geracao sem indicacao e aplicacao rigorosa de precaucoes de contato.'
                  WHEN 2 THEN 'PLAN: Zerar episodios de depressao respiratoria grave por opioides sem deteccao precoce na URPA e reduzir em 70% hipoglicemias hospitalares. Acoes: oximetria e capnografia continuas pos-opioide, kit de naloxona imediato e revisao do protocolo de escala de insulina.'
                  WHEN 3 THEN 'PLAN: Reduzir a taxa de infeccao de sitio cirurgico profunda de 6,2% para menos de 2,5% e zerar atrasos no retorno ao bloco operatorio por hemorragia. Acoes: banho pre-operatorio padronizado, antibioticoprofilaxia 30-60min antes da incisao e checklist cirurgico completo.'
                  WHEN 4 THEN 'PLAN: Reduzir a densidade de incidencia de PAV para menos de 8 casos por 1.000 dias de ventilacao mecanica. Acoes: implementacao do bundle de 5 elementos (cabeceira 30-45 graus, higiene oral com clorexidina 0,12%, aspiracao subglotica, pausa de sedacao e teste de extubacao).'
                  WHEN 5 THEN 'PLAN: Reduzir a frequencia de choque hipovolemico por hemorragia pos-parto e laceracoes perineais graves em 50%. Acoes: kit de emergencia de HPP pronto em cada sala de parto, administracao de ocitocina profilatica imediata e tecnica de protecao manual perineal.'
                END,
                CASE v_turma_idx
                  WHEN 1 THEN 'DO: Protocolos revisados e validados pelo Nucleo de Seguranca do Paciente (NSP) e CCIH. Capacitacao presencial de 100% dos medicos residentes e tecnicos de enfermagem. Inclusao de campos especificos no prontuario eletronico para registro de justificativas de prescricao.'
                  WHEN 2 THEN 'DO: Treinamento em estacoes de simulacao clinica de overdose de opioides e parada cardiorrespiratoria com uso de naloxona. Implantacao do sistema de alerta visual vermelho no posto de enfermagem para pacientes recebendo insulina em jejum.'
                  WHEN 3 THEN 'DO: Implantacao obrigatoria de parada cirurgica (Time-out e Sign-out) auditada pela equipe de enfermagem perioperatoria. Troca dos tricotomizadores tradicionais por cortadores eletricos com lamina descartavel.'
                  WHEN 4 THEN 'DO: Designacao de um enfermeiro e um fisioterapeuta dedicados ao checklist diario do bundle na UTI. Instalacao de marcadores visuais de inclinacao de 30-45 graus em todas as camas de pacientes ventilados.'
                  WHEN 5 THEN 'DO: Montagem de 6 carrinhos moveis de HPP distribuidos no centro obstetrico com baloes de tamponamento intrauterino, uterotonicos e acidos tranexamicos. Treinamento em manequins obstetricos de alta fidelidade.'
                END,
                CASE v_turma_idx
                  WHEN 1 THEN 'CHECK: Apos 60 dias de implementacao, auditoria demonstrou adesao de 88% ao checklist de anticoagulacao e queda de 38% nas taxas de INR acima de 6,0. Nenhum novo caso de C. difficile grave com perfuracao intestinal documentado.'
                  WHEN 2 THEN 'CHECK: Registro de 94% de conformidade na monitorizacao pos-operatoria com oximetria de pulso. Episodios de hipoglicemia grave (<40 mg/dL) reduzidos de 5 casos/mes para 1 caso/mes na enfermaria monitorada.'
                  WHEN 3 THEN 'CHECK: Adesao ao checklist de cirurgia segura atingiu 92% das intervencoes cirurgicas eletivas. A taxa de ISC em cirurgias colorretais apresentou declinio de 42% no trimestre avaliado.'
                  WHEN 4 THEN 'CHECK: Densidade de incidencia de PAV caiu de 17,2 para 9,4 por 1.000 pacientes-dia em ventilacao mecanica. Taxa de extubacao bem-sucedida sem necessidade de reintubacao em 48h subiu para 93%.'
                  WHEN 5 THEN 'CHECK: Manejo ativo do 3 estagio documentado em 96% dos partos vaginais. O tempo medio de diagnostico e inicio da ressuscitation volemica na atonia uterina caiu de 18 para 4 minutos.'
                END,
                CASE v_turma_idx
                  WHEN 1 THEN 'ACT: Institucionalizar o protocolo de prevencao de IRAS e anticoagulacao segura no Manual da Qualidade do HU-UFS. Iniciar proximo ciclo PDCA com foco na integracao automatica do laboratorio com alertas por SMS para plantonistas.'
                  WHEN 2 THEN 'ACT: Padronizar o algoritmo de reversao por naloxona como norma institucional permanente. Iniciar novo ciclo com expansao da dupla checagem para anticoagulantes injetaveis e quimioterapicos.'
                  WHEN 3 THEN 'ACT: Tornar o checklist cirurgico pre-requisito obrigatorio no sistema eletronico para faturamento do procedimento. Novo ciclo direcionado a profilaxia de eventos tromboembolicos (TEV) pos-alta.'
                  WHEN 4 THEN 'ACT: Consolidar o bundle de PAV no painel de metas assistenciais do hospital com divulgacao mensal a diretoria clinica. Novo ciclo voltado a reducao do tempo medio de permanencia em UTI.'
                  WHEN 5 THEN 'ACT: Adotar a simulacao realistica de hemorragia obstetrica como treinamento semestral mandatorio para novos medicos residentes e contratados da maternidade do HU-UFS.'
                END
              ) ON CONFLICT (revisao_individual_id) DO NOTHING;

              -- 40% dos que acham gatilho primario encontram um segundo gatilho no prontuario
            END IF; -- fim MQ 60%

          END IF; -- fim finalizada

          v_revisao_id := NULL;

        END LOOP; -- pront_idx
      END LOOP; -- atv_idx
    END LOOP; -- aluno_idx
  END LOOP; -- turma_idx

END $$;
