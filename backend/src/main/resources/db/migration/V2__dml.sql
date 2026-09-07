-- =============================================================================
-- SIGEA-GTT: Carga Inicial de Dados (DML)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USUÁRIO ADMINISTRADOR INICIAL (Senha padrão: Sigea@123)
-- -----------------------------------------------------------------------------
INSERT INTO usuarios (
    nome_completo,
    cpf,
    email,
    cargo,
    matricula_sigaa,
    perfil,
    senha,
    primeiro_acesso,
    ativo
) VALUES (
    'Matheus Araujo Pereira',
    '06318913580',
    'matheus.pereira@dcomp.ufs.br',
    'Administrador Inicial do Sistema',
    NULL,
    'ADMINISTRADOR',
    '$2a$10$wK1F5n8g1d3a5t2E7e8eYeO3V3eKz0c5L7lQ9t2bX1mZ0k.Sigea.',
    FALSE,
    TRUE
) ON CONFLICT (cpf) DO UPDATE
SET email = EXCLUDED.email,
    nome_completo = EXCLUDED.nome_completo,
    cargo = EXCLUDED.cargo,
    perfil = EXCLUDED.perfil,
    ativo = TRUE;

-- -----------------------------------------------------------------------------
-- 2. UNIDADES HOSPITALARES ASSISTENCIAIS (HU-UFS)
-- -----------------------------------------------------------------------------
INSERT INTO unidades_hospitalares (nome, sigla, ativa) VALUES
    ('Clínica Médica Geral', 'CMED', true),
    ('Clínica Cirúrgica / Bloco Operatório', 'CCIR', true),
    ('Unidade de Terapia Intensiva Adulto', 'UTI-A', true),
    ('Maternidade / Alojamento Conjunto', 'MAT', true),
    ('Serviço de Urgência e Emergência', 'SUE', true),
    ('Unidade de Recuperação Pós-Anestésica', 'URPA', true);

-- -----------------------------------------------------------------------------
-- 3. MÓDULOS OFICIAIS IHI-GTT
-- -----------------------------------------------------------------------------
INSERT INTO modulos_gtt (codigo, nome, descricao, ativo) VALUES
    ('CUIDADOS', 'Módulo Cuidados', 'Rastreadores gerais de cuidados assistenciais e monitorização clínica', true),
    ('MEDICACAO', 'Módulo Medicação', 'Rastreadores de eventos adversos associados a fármacos e toxicidade', true),
    ('CIRURGICO', 'Módulo Cirúrgico', 'Rastreadores no perioperatório, bloco cirúrgico e anestesia', true),
    ('TERAPIA_INTENSIVA', 'Módulo Cuidados Intensivos/Terapia Intensiva', 'Rastreadores críticos em unidade de terapia intensiva', true),
    ('PERINATAL', 'Módulo Perinatal', 'Rastreadores obstétricos e materno-fetais', true),
    ('EMERGENCIA', 'Módulo Serviço de Urgência/Pronto Atendimento', 'Rastreadores de urgência, tempo de permanência e complicações agudas', true);

-- -----------------------------------------------------------------------------
-- 4. CATÁLOGO COMPLETO DOS 53 GATILHOS IHI-GTT (2ª EDIÇÃO)
-- -----------------------------------------------------------------------------

-- MÓDULO CUIDADOS (C1 a C15)
INSERT INTO gatilhos_gtt (codigo, modulo_id, descricao, limiar_referencia, ativo) VALUES
    ('C1', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Transfusão de sangue, hemocomponentes ou hemoderivados. Investigar perda além da esperada em cirurgia ou sangramento por anticoagulantes.', 'Transfusão além da perda de sangue esperada nas primeiras 24 horas de cirurgia ou por anticoagulantes', true),
    ('C2', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Paragem/parada cardíaca ou respiratória ou ativação de equipa/time de resposta rápida.', 'Paragem/parada intraoperatória, na URPA ou primeiras 24 horas de pós-operatório', true),
    ('C3', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Diálise aguda. Uma nova necessidade de diálise pode ser o curso de um processo de doença ou o resultado de um evento adverso (insuficiência renal induzida por drogas ou reação a contraste).', 'Nova necessidade de diálise após admissão hospitalar', true),
    ('C4', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Hemocultura positiva. Uma hemocultura positiva a qualquer momento durante a hospitalização deve ser investigada como indicador de um evento adverso, especificamente uma infecção relacionada com os cuidados de saúde.', 'Infecções diagnosticadas 48 horas ou mais após a admissão', true),
    ('C5', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Exame de imagem para detecção de embolia pulmonar ou trombose venosa profunda.', 'Desenvolvimento de TVP ou EP durante a hospitalização ou após procedimento', true),
    ('C6', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Queda superior a 25% nos valores de hemoglobina ou hematócrito.', 'Redução de 25% ou mais nos níveis de Hg ou Hct em 72 horas ou menos', true),
    ('C7', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Queda do paciente. Qualquer queda em um ambiente de cuidado que cause danos, independentemente da causa, é um evento adverso; uma queda sem ferimentos não é um evento adverso.', 'Queda em ambiente de cuidado que resulte em danos físicos', true),
    ('C8', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Lesões por pressão. As lesões por pressão são eventos adversos se ocorridos durante uma hospitalização.', 'Ocorrência ou agravamento de lesão por pressão durante a hospitalização', true),
    ('C9', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Readmissão em até 30 dias após a alta.', 'Readmissão hospitalar em até 30 dias após a alta', true),
    ('C10', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Uso de contenção física no leito. Sempre que contenções forem usadas, reveja as razões documentadas e avalie a possível relação entre o uso das contenções e confusão mental por uso de medicamentos.', 'Uso de contenção física associado a confusão mental ou toxicidade', true),
    ('C11', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Infecções relacionadas com os cuidados de saúde. Qualquer infecção que ocorra após a admissão no hospital é, provavelmente, um evento adverso, especialmente aquelas relacionadas a procedimentos ou a uso de dispositivos.', 'Infecção diagnosticada após a admissão relacionada a procedimentos ou dispositivos', true),
    ('C12', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Acidente Vascular Cerebral (AVC) no hospital. Avaliar a causa do AVC para determinar se está associado a um procedimento (cirúrgico, cardioversão) ou anticoagulação.', 'AVC ocorrido durante a hospitalização associado a procedimento ou anticoagulação', true),
    ('C13', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Transferência para unidade de maior complexidade. Transferências para unidades de maior complexidade dentro da instituição ou para outra instituição devem ser revistas quanto a deterioração por evento adverso.', 'Transferência para UTI, cuidados intermediários ou centro de maior suporte', true),
    ('C14', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Qualquer complicação de procedimentos. Uma complicação resultante de qualquer procedimento é um evento adverso.', 'Complicação resultante de qualquer procedimento documentada no prontuário', true),
    ('C15', (SELECT id FROM modulos_gtt WHERE codigo = 'CUIDADOS'), 'Outros. Evento adverso que não se encaixa em um trigger específico de cuidados.', 'Dano físico não intencional resultante dos cuidados assistenciais', true);

-- MÓDULO MEDICAÇÃO (M1 a M13)
INSERT INTO gatilhos_gtt (codigo, modulo_id, descricao, limiar_referencia, ativo) VALUES
    ('M1', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Resultado positivo para Clostridium difficile em fezes. Uma pesquisa positiva para C. difficile é um evento adverso se houver histórico de uso de antibióticos.', 'Pesquisa positiva para C. difficile em fezes com histórico de antibióticos', true),
    ('M2', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Tempo de tromboplastina parcial ativado (aPTT/TTPa) maior que 100 segundos em uso de heparina com evidências de manifestações como sangramento, hematomas ou queda de Hg/Hct.', 'aPTT/TTPa > 100 segundos associado a manifestações clínicas', true),
    ('M3', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Razão Normalizada Internacional (INR/RNI) maior que 6. Procure por evidências de sangramento para determinar se um evento adverso ocorreu.', 'INR/RNI > 6 com manifestações de sangramento ou hematomas', true),
    ('M4', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Glicemia menor que 50 mg/dL associada a sintomas (letargia, tremores) e intervenção com glicose, suco ou outro alimento, com uso associado de insulina ou hipoglicemiantes.', 'Glicemia < 50 mg/dL com sintomas clínicos documentados e intervenção', true),
    ('M5', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Elevação de ureia ou creatinina sérica para valor duas vezes superior ao basal associada a medicamentos que podem causar toxicidade renal.', 'Elevação de ureia ou creatinina sérica >= 2x valor basal por fármacos', true),
    ('M6', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Administração de vitamina K (fitomenadiona) utilizada como resposta a um INR/RNI alargado com evidências de sangramento.', 'Administração de vitamina K em resposta a sangramento ou INR alargado', true),
    ('M7', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Administração de anti-histamínico (difenidramina, dexclorfeniramina, clemastina, hidroxizina) para sintomas de reação alérgica a medicamento ou transfusão de sangue.', 'Uso de anti-histamínico para reação alérgica medicamentosa ou transfusional', true),
    ('M8', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Administração de flumazenil para reverter benzodiazepínicos por hipotensão grave ou sedação acentuada e prolongada.', 'Administração de flumazenil para reversão de benzodiazepínicos', true),
    ('M9', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Administração de naloxona como antagonista potente de opioides decorrente de depressão respiratória.', 'Administração de naloxona para reversão de depressão por opioides', true),
    ('M10', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Administração de antieméticos para náuseas e vômitos persistentes que interfiram na alimentação, recuperação pós-operatória ou atrasem a alta.', 'Náuseas e vômitos persistentes interferindo na alimentação ou alta', true),
    ('M11', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Hipotensão/sedação excessiva e letargia relacionadas à administração de sedativo, analgésico ou relaxante muscular.', 'Sedação excessiva, letargia ou hipotensão induzida por medicamentos', true),
    ('M12', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Suspensão abrupta de medicamentos como interrupção inesperada ou desvio da prática usual por suspeita de evento adverso ou toxicidade.', 'Suspensão inesperada ou abrupta de fármaco por toxicidade/reação adversa', true),
    ('M13', (SELECT id FROM modulos_gtt WHERE codigo = 'MEDICACAO'), 'Outros eventos adversos relacionados a medicamentos não associados aos triggers anteriores.', 'Qualquer evento adverso a medicamento não classificado em M1-M12', true);

-- MÓDULO CIRÚRGICO (S1 a S11)
INSERT INTO gatilhos_gtt (codigo, modulo_id, descricao, limiar_referencia, ativo) VALUES
    ('S1', (SELECT id FROM modulos_gtt WHERE codigo = 'CIRURGICO'), 'Reintervenção cirúrgica planejada ou não decorrente de complicação (ex.: hemorragia interna com necessidade de exploração cirúrgica).', 'Retorno não previsto ao centro cirúrgico para controle de complicações', true),
    ('S2', (SELECT id FROM modulos_gtt WHERE codigo = 'CIRURGICO'), 'Mudança de procedimento operatório em relação ao planejado por achado inesperado, complicações ou falhas em dispositivos.', 'Mudança inesperada de técnica/procedimento cirúrgico por complicação', true),
    ('S3', (SELECT id FROM modulos_gtt WHERE codigo = 'CIRURGICO'), 'Admissão em unidade de cuidados intensivos/terapia intensiva no pós-operatório inesperada decorrente de eventos operatórios.', 'Admissão não planejada em UTI após cirurgia', true),
    ('S4', (SELECT id FROM modulos_gtt WHERE codigo = 'CIRURGICO'), 'Intubação ou reintubação ou uso de BiPap na unidade de recuperação pós-anestésica por depressão respiratória.', 'Reintubação ou ventilação não invasiva na unidade pós-anestésica', true),
    ('S5', (SELECT id FROM modulos_gtt WHERE codigo = 'CIRURGICO'), 'Raio X intraoperatório ou na RPA por suspeita de itens retidos ou contagem incorreta de instrumentos ou compressas.', 'Radiografia não programada para investigação de corpo estranho retido', true),
    ('S6', (SELECT id FROM modulos_gtt WHERE codigo = 'CIRURGICO'), 'Morte intra ou no pós-operatório (todas as mortes exigem revisão como eventos adversos, exceto cirurgia heroica esperada).', 'Óbito ocorrido no ato cirúrgico ou período pós-operatório', true),
    ('S7', (SELECT id FROM modulos_gtt WHERE codigo = 'CIRURGICO'), 'Ventilação mecânica por tempo superior a 24 horas no pós-operatório não prevista para o procedimento.', 'Ventilação mecânica invasiva > 24 horas no pós-operatório', true),
    ('S8', (SELECT id FROM modulos_gtt WHERE codigo = 'CIRURGICO'), 'Administração intraoperatória de adrenalina, noradrenalina, naloxona ou flumazenil para hipotensão por sangramento ou sedação excessiva.', 'Uso não planejado de vasopressores ou reversores no intraoperatório', true),
    ('S9', (SELECT id FROM modulos_gtt WHERE codigo = 'CIRURGICO'), 'Aumento do nível de troponina superior a 1,5 nanograma/mL no pós-operatório indicando evento isquêmico cardíaco.', 'Troponina sérica > 1,5 ng/mL no pós-operatório', true),
    ('S10', (SELECT id FROM modulos_gtt WHERE codigo = 'CIRURGICO'), 'Lesão, reparação ou remoção de órgão durante o procedimento cirúrgico decorrente de complicação ou lesão acidental.', 'Lesão, reparação ou ressecção de órgão não prevista no procedimento inicial', true),
    ('S11', (SELECT id FROM modulos_gtt WHERE codigo = 'CIRURGICO'), 'Ocorrência de qualquer complicação cirúrgica documentada (EP, TVP, lesão por pressão, IAM, insuficiência renal, infecção ou deiscência).', 'Qualquer complicação pós-cirúrgica documentada em prontuário', true);

-- MÓDULO CUIDADOS INTENSIVOS/TERAPIA INTENSIVA (I1 a I4)
INSERT INTO gatilhos_gtt (codigo, modulo_id, descricao, limiar_referencia, ativo) VALUES
    ('I1', (SELECT id FROM modulos_gtt WHERE codigo = 'TERAPIA_INTENSIVA'), 'Pneumonia com início no hospital diagnosticada na terapia intensiva ou associada à ventilação mecânica.', 'Pneumonia nosocomial ou associada à ventilação (PAV) iniciada na UTI', true),
    ('I2', (SELECT id FROM modulos_gtt WHERE codigo = 'TERAPIA_INTENSIVA'), 'Readmissão em unidade de cuidados intensivos/terapia intensiva durante a mesma hospitalização.', 'Readmissão não programada em unidade de terapia intensiva', true),
    ('I3', (SELECT id FROM modulos_gtt WHERE codigo = 'TERAPIA_INTENSIVA'), 'Procedimentos em unidade de cuidados intensivos/terapia intensiva com complicações decorrentes dos cuidados.', 'Intercorrências ou complicações decorrentes de procedimentos na UTI', true),
    ('I4', (SELECT id FROM modulos_gtt WHERE codigo = 'TERAPIA_INTENSIVA'), 'Intubação ou reintubação não planejada ou falha de extubação na UTI.', 'Reintubação orotraqueal não planejada após extubação prévia', true);

-- MÓDULO PERINATAL (P1 a P8)
INSERT INTO gatilhos_gtt (codigo, modulo_id, descricao, limiar_referencia, ativo) VALUES
    ('P1', (SELECT id FROM modulos_gtt WHERE codigo = 'PERINATAL'), 'Uso de agentes tocolíticos (atosiban, indometacina, terbutalina, nifedipina, sulfato de magnésio) resultando em intervenção desnecessária de cesariana.', 'Uso de tocolítico associado a intervenção cirúrgica desnecessária', true),
    ('P2', (SELECT id FROM modulos_gtt WHERE codigo = 'PERINATAL'), 'Lacerações de 3º e 4º graus no canal de parto (evento adverso por definição).', 'Laceração perineal obstétrica de 3º ou 4º grau', true),
    ('P3', (SELECT id FROM modulos_gtt WHERE codigo = 'PERINATAL'), 'Contagem de plaquetas inferior a 50.000 no período periparto associada a sangramento ou transfusão.', 'Plaquetopenia materna < 50.000/mm³ no período periparto', true),
    ('P4', (SELECT id FROM modulos_gtt WHERE codigo = 'PERINATAL'), 'Perda de sangue estimada superior a 500 mL para parto vaginal ou 1.000 mL para parto cesariana.', 'Perda sanguínea > 500 mL (vaginal) ou > 1.000 mL (cesariana)', true),
    ('P5', (SELECT id FROM modulos_gtt WHERE codigo = 'PERINATAL'), 'Consulta com outra especialidade/interconsulta obstétrica urgente como indicador de lesão materna.', 'Interconsulta médica urgente por complicação obstétrica materna', true),
    ('P6', (SELECT id FROM modulos_gtt WHERE codigo = 'PERINATAL'), 'Administração de oxitocina/ocitocina e similares no pós-parto em quantidades superiores a 20 unidades para controle de hemorragia.', 'Administração > 20 unidades de ocitocina no pós-parto para hemorragia', true),
    ('P7', (SELECT id FROM modulos_gtt WHERE codigo = 'PERINATAL'), 'Parto instrumentalizado (fórceps ou vácuo-extrator) com trauma, hematoma ou laceração materna.', 'Parto instrumental com lesão, hematoma ou trauma perineal materno', true),
    ('P8', (SELECT id FROM modulos_gtt WHERE codigo = 'PERINATAL'), 'Administração de anestesia geral não programada em procedimento obstétrico.', 'Conversão ou uso não eletivo de anestesia geral obstétrica', true);

-- MÓDULO SERVIÇO DE URGÊNCIA/PRONTO ATENDIMENTO (E1 e E2)
INSERT INTO gatilhos_gtt (codigo, modulo_id, descricao, limiar_referencia, ativo) VALUES
    ('E1', (SELECT id FROM modulos_gtt WHERE codigo = 'EMERGENCIA'), 'Readmissão no serviço de urgência/pronto atendimento nas 48 horas após a alta com necessidade de hospitalização.', 'Retorno ao pronto atendimento em até 48 horas após a alta com internação', true),
    ('E2', (SELECT id FROM modulos_gtt WHERE codigo = 'EMERGENCIA'), 'Tempo de permanência no serviço de urgência/pronto atendimento superior a 6 horas com desenvolvimento de complicações.', 'Tempo de permanência no pronto atendimento > 6 horas', true);
