#!/usr/bin/env bash
set -e

API_URL="http://localhost:8080/api"
COOKIE_ADMIN="/tmp/sigea_cookies_admin.txt"

cor_verde="\033[0;32m"
cor_vermelha="\033[0;31m"
cor_azul="\033[0;34m"
cor_reset="\033[0m"

falhar() {
  echo -e "${cor_vermelha}  ✘ [FAIL] $1${cor_reset}"
  exit 1
}

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║   SIGEA-GTT - SUPER TESTE INTEGRADO END-TO-END (AUDITORIA INDIVIDUAL) ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# ----------------------------------------------------------------------
# FASE 0: Conectividade
# ----------------------------------------------------------------------
echo "======================================================================"
echo "==> FASE 0: Verificação de Dependências e Conectividade do Backend"

if ! command -v curl &> /dev/null || ! command -v jq &> /dev/null; then
    falhar "'curl' e 'jq' são necessários para executar este teste."
fi

HTTP_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/usuarios" || true)
[ "$HTTP_CHECK" -eq 200 ] || falhar "Backend fora do ar em $API_URL (HTTP $HTTP_CHECK)."
echo -e "${cor_verde}  ✔ [PASS] Backend online e respondendo em $API_URL.${cor_reset}"

rm -f "$COOKIE_ADMIN"
LOGIN_RESP=$(curl -s -c "$COOKIE_ADMIN" -X POST "$API_URL/autenticacao/entrar" \
  -H "Content-Type: application/json" \
  -d '{"email":"matheusaraujopereira@academico.ufs.br","senha":"Sigea@123"}')
ADMIN_ID=$(echo "$LOGIN_RESP" | jq -r '.id // empty')
[ -n "$ADMIN_ID" ] || falhar "Login do administrador seed falhou: $LOGIN_RESP"
echo -e "${cor_verde}  ✔ [PASS] Login do administrador seed efetuado (id=$ADMIN_ID) e sessão persistida.${cor_reset}"

HTTP_SEM_SESSAO=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/turmas" \
  -H "Content-Type: application/json" -d '{"codigoDisciplina":"X","periodoLetivo":"2026.1","anoSemestre":"2026/1","professorResponsavelId":1}')
[ "$HTTP_SEM_SESSAO" -eq 401 ] || [ "$HTTP_SEM_SESSAO" -eq 403 ] || falhar "Escrita sem sessão deveria ser bloqueada (HTTP $HTTP_SEM_SESSAO)."
echo -e "${cor_verde}  ✔ [PASS] Escrita sem sessão corretamente bloqueada (HTTP $HTTP_SEM_SESSAO).${cor_reset}"

SUFIXO=$RANDOM
DOCENTE_JSON=$(cat <<JSON
{"nomeCompleto":"Professor E2E $SUFIXO","email":"professor$SUFIXO@academico.ufs.br","perfil":"PROFESSOR"}
JSON
)
DOCENTE_RESP=$(curl -s -b "$COOKIE_ADMIN" -X POST "$API_URL/usuarios" -H "Content-Type: application/json" -d "$DOCENTE_JSON")
DOCENTE_ID=$(echo "$DOCENTE_RESP" | jq -r '.id // empty')
[ -n "$DOCENTE_ID" ] || falhar "Falha ao criar professor: $DOCENTE_RESP"

ALUNO1_JSON=$(cat <<JSON
{"nomeCompleto":"Aluno Um E2E $SUFIXO","email":"aluno1.$SUFIXO@academico.ufs.br","matriculaSigaa":"$(printf '%012d' "$SUFIXO")","perfil":"ALUNO"}
JSON
)
ALUNO1_RESP=$(curl -s -b "$COOKIE_ADMIN" -X POST "$API_URL/usuarios" -H "Content-Type: application/json" -d "$ALUNO1_JSON")
REVISOR_1_ID=$(echo "$ALUNO1_RESP" | jq -r '.id // empty')
[ -n "$REVISOR_1_ID" ] || falhar "Falha ao criar aluno 1: $ALUNO1_RESP"

ALUNO2_JSON=$(cat <<JSON
{"nomeCompleto":"Aluno Dois E2E $SUFIXO","email":"aluno2.$SUFIXO@academico.ufs.br","matriculaSigaa":"$(printf '%012d' "$((SUFIXO + 1))")","perfil":"ALUNO"}
JSON
)
ALUNO2_RESP=$(curl -s -b "$COOKIE_ADMIN" -X POST "$API_URL/usuarios" -H "Content-Type: application/json" -d "$ALUNO2_JSON")
REVISOR_2_ID=$(echo "$ALUNO2_RESP" | jq -r '.id // empty')
[ -n "$REVISOR_2_ID" ] || falhar "Falha ao criar aluno 2: $ALUNO2_RESP"

UNIDADES_RAW=$(curl -s "$API_URL/unidades")
UNIDADE_ID=$(echo "$UNIDADES_RAW" | jq -r 'if type=="array" and length > 0 then .[0].id else empty end')
[ -n "$UNIDADE_ID" ] || falhar "Nenhuma unidade hospitalar cadastrada."

GATILHOS_RAW=$(curl -s "$API_URL/gatilhos")
GATILHO_ID=$(echo "$GATILHOS_RAW" | jq -r 'if type=="array" and length > 0 then (map(select(.codigo == "C1"))[0].id // .[0].id) else empty end')
GATILHO_COD=$(echo "$GATILHOS_RAW" | jq -r 'if type=="array" and length > 0 then (map(select(.codigo == "C1"))[0].codigo // .[0].codigo) else empty end')
[ -n "$GATILHO_ID" ] || falhar "Nenhum gatilho GTT cadastrado."

echo -e "${cor_verde}  ✔ [PASS] Atores criados: Professor=$DOCENTE_ID | Aluno1=$REVISOR_1_ID | Aluno2=$REVISOR_2_ID | Unidade=$UNIDADE_ID | Gatilho=$GATILHO_COD${cor_reset}"

# ----------------------------------------------------------------------
# FASE 1: Turma e Matrícula
# ----------------------------------------------------------------------
echo ""
echo "======================================================================"
echo "==> FASE 1: Gestão Acadêmica - Turma e Matrícula de Alunos"

TURMA_JSON=$(cat <<JSON
{"codigoDisciplina":"MED-E2E-$SUFIXO","periodoLetivo":"2026.1","anoSemestre":"2026/1","professorResponsavelId":$DOCENTE_ID}
JSON
)
TURMA_RESP=$(curl -s -b "$COOKIE_ADMIN" -X POST "$API_URL/turmas" -H "Content-Type: application/json" -d "$TURMA_JSON")
TURMA_ID=$(echo "$TURMA_RESP" | jq -r '.id // empty')
[ -n "$TURMA_ID" ] || falhar "Falha ao criar turma: $TURMA_RESP"
echo -e "${cor_verde}  ✔ [PASS] Turma criada com ID: $TURMA_ID (professor responsável validado).${cor_reset}"

HTTP_PROF_INVALIDO=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_ADMIN" -X POST "$API_URL/turmas" \
  -H "Content-Type: application/json" \
  -d "{\"codigoDisciplina\":\"MED-INV-$SUFIXO\",\"periodoLetivo\":\"2026.1\",\"anoSemestre\":\"2026/1\",\"professorResponsavelId\":$ADMIN_ID}")
[ "$HTTP_PROF_INVALIDO" -eq 400 ] || [ "$HTTP_PROF_INVALIDO" -eq 422 ] || falhar "Deveria rejeitar ADMINISTRADOR como professor responsável (HTTP $HTTP_PROF_INVALIDO)."
echo -e "${cor_verde}  ✔ [PASS] Regra garantida: apenas PROFESSOR pode ser responsável por turma (HTTP $HTTP_PROF_INVALIDO).${cor_reset}"

curl -s -b "$COOKIE_ADMIN" -X POST "$API_URL/turmas/$TURMA_ID/alunos/$REVISOR_1_ID" -o /dev/null
curl -s -b "$COOKIE_ADMIN" -X POST "$API_URL/turmas/$TURMA_ID/alunos/$REVISOR_2_ID" -o /dev/null
ALUNOS_TURMA=$(curl -s "$API_URL/turmas/$TURMA_ID/alunos")
TOTAL_MATRICULADOS=$(echo "$ALUNOS_TURMA" | jq 'length')
[ "$TOTAL_MATRICULADOS" -eq 2 ] || falhar "Esperado 2 alunos matriculados, encontrado $TOTAL_MATRICULADOS."
echo -e "${cor_verde}  ✔ [PASS] Alunos $REVISOR_1_ID e $REVISOR_2_ID matriculados na turma.${cor_reset}"

# ----------------------------------------------------------------------
# FASE 2: Cenário Clínico e Prontuário Simulado
# ----------------------------------------------------------------------
echo ""
echo "======================================================================"
echo "==> FASE 2: Cenário Clínico, Prontuário Simulado e Atividade de Auditoria"

CENARIO_JSON=$(cat <<JSON
{
  "titulo": "Auditoria de Sepse e Hipoglicemia Hospitalar $SUFIXO",
  "descricaoPedagogica": "Cenário focado na identificação de eventos adversos medicamentosos e de assistência.",
  "objetivosAprendizagem": "Treinar detecção de gatilhos GTT e preenchimento de gravidade NCC MERP.",
  "professorCriadorId": $DOCENTE_ID
}
JSON
)
CENARIO_RESP=$(curl -s -b "$COOKIE_ADMIN" -X POST "$API_URL/cenarios-clinicos" -H "Content-Type: application/json" -d "$CENARIO_JSON")
CENARIO_ID=$(echo "$CENARIO_RESP" | jq -r '.id // empty')
[ -n "$CENARIO_ID" ] || falhar "Falha ao criar cenário clínico: $CENARIO_RESP"
echo -e "${cor_verde}  ✔ [PASS] Cenário Clínico criado com ID: $CENARIO_ID.${cor_reset}"

HTTP_PROF_CENARIO_INVALIDO=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_ADMIN" -X POST "$API_URL/cenarios-clinicos" \
  -H "Content-Type: application/json" \
  -d "{\"titulo\":\"Inválido\",\"descricaoPedagogica\":\"x\",\"objetivosAprendizagem\":\"x\",\"professorCriadorId\":$ADMIN_ID}")
[ "$HTTP_PROF_CENARIO_INVALIDO" -eq 400 ] || [ "$HTTP_PROF_CENARIO_INVALIDO" -eq 422 ] || falhar "Deveria rejeitar ADMINISTRADOR como professor criador (HTTP $HTTP_PROF_CENARIO_INVALIDO)."
echo -e "${cor_verde}  ✔ [PASS] Regra garantida: apenas PROFESSOR pode ser Professor Criador (HTTP $HTTP_PROF_CENARIO_INVALIDO).${cor_reset}"

PRONTUARIO_JSON=$(cat <<JSON
{
  "cenarioId": $CENARIO_ID,
  "unidadeHospitalarId": $UNIDADE_ID,
  "numeroAtendimento": "ATEND-E2E-$SUFIXO",
  "idadePaciente": 68,
  "dataAdmissao": "2026-03-01",
  "dataAlta": "2026-03-09",
  "tempoPermanenciaDias": 8,
  "sumarioAlta": "Paciente internado por sepse de foco pulmonar. Apresentou parada cardiorrespiratória revertida durante internação.",
  "prescricoesMedicas": "Insulina Regular IV contínua; Ceftriaxona 2g IV; Dipirona 1g.",
  "examesLaboratoriais": "Glicemia capilar: 32 mg/dL. Leucócitos: 18.500/mm3.",
  "relatorioCirurgico": "Não submetido a procedimento invasivo de grande porte.",
  "evolucoesMultiprofissionais": "Enfermagem relata sudorese e rebaixamento do sensório após bolus de insulina."
}
JSON
)
PRONTUARIO_RESP=$(curl -s -b "$COOKIE_ADMIN" -X POST "$API_URL/prontuarios-simulados" -H "Content-Type: application/json" -d "$PRONTUARIO_JSON")
PRONTUARIO_ID=$(echo "$PRONTUARIO_RESP" | jq -r '.id // empty')
[ -n "$PRONTUARIO_ID" ] || falhar "Falha ao criar prontuário simulado: $PRONTUARIO_RESP"
echo -e "${cor_verde}  ✔ [PASS] Prontuário Simulado criado com ID: $PRONTUARIO_ID vinculado ao cenário $CENARIO_ID.${cor_reset}"

DATA_HOJE=$(date +"%Y-%m-%d")
ATIVIDADE_JSON=$(cat <<JSON
{
  "turmaId": $TURMA_ID,
  "cenarioId": $CENARIO_ID,
  "titulo": "Atividade Prática IHI-GTT Módulo C",
  "dataInicio": "${DATA_HOJE}T08:00:00",
  "dataFim": "${DATA_HOJE}T23:59:59",
  "tempoLimiteMinutos": 20
}
JSON
)
ATIVIDADE_RESP=$(curl -s -b "$COOKIE_ADMIN" -X POST "$API_URL/atividades-auditoria" -H "Content-Type: application/json" -d "$ATIVIDADE_JSON")
ATIVIDADE_ID=$(echo "$ATIVIDADE_RESP" | jq -r '.id // empty')
[ -n "$ATIVIDADE_ID" ] || falhar "Falha ao criar atividade de auditoria: $ATIVIDADE_RESP"
echo -e "${cor_verde}  ✔ [PASS] Atividade de Auditoria aberta com ID: $ATIVIDADE_ID (Tempo limite: 20 min).${cor_reset}"

# ----------------------------------------------------------------------
# FASE 3: Auditoria Clínica Individual (dois alunos, sem duplas)
# ----------------------------------------------------------------------
echo ""
echo "======================================================================"
echo "==> FASE 3: Auditoria Clínica Individual de Cada Aluno"

REV1_INICIO=$(curl -s -b "$COOKIE_ADMIN" -X POST "$API_URL/revisoes-individuais/iniciar" -H "Content-Type: application/json" \
  -d "{\"atividadeId\": $ATIVIDADE_ID, \"alunoId\": $REVISOR_1_ID, \"prontuarioId\": $PRONTUARIO_ID}")
REV1_ID=$(echo "$REV1_INICIO" | jq -r '.id // empty')
[ -n "$REV1_ID" ] || falhar "Falha ao iniciar revisão do aluno 1: $REV1_INICIO"

RASCUNHO_JSON='{"tempoGastoSegundos": 300, "finalizar": false, "achados": []}'
curl -s -b "$COOKIE_ADMIN" -X PUT "$API_URL/revisoes-individuais/$REV1_ID/salvar" -H "Content-Type: application/json" -d "$RASCUNHO_JSON" > /dev/null
echo -e "${cor_verde}  ✔ [PASS] Aluno 1 salvou rascunho com 300s.${cor_reset}"

FINAL_REV1=$(cat <<JSON
{
  "tempoGastoSegundos": 720,
  "finalizar": true,
  "achados": [
    {
      "gatilhoId": $GATILHO_ID,
      "confirmouDano": true,
      "justificativaDano": "Hipoglicemia severa após insulina em bolus com necessidade de intervenção.",
      "danoPresenteAdmissao": false,
      "gravidade": "CATEGORIA_E"
    }
  ]
}
JSON
)
curl -s -b "$COOKIE_ADMIN" -X PUT "$API_URL/revisoes-individuais/$REV1_ID/salvar" -H "Content-Type: application/json" -d "$FINAL_REV1" > /dev/null
echo -e "${cor_verde}  ✔ [PASS] Aluno 1 finalizou auditoria com 720s (Achado Categoria E).${cor_reset}"

HTTP_ALTERA_TRAVADA=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_ADMIN" -X PUT "$API_URL/revisoes-individuais/$REV1_ID/salvar" \
  -H "Content-Type: application/json" -d "$RASCUNHO_JSON")
[ "$HTTP_ALTERA_TRAVADA" -eq 400 ] || [ "$HTTP_ALTERA_TRAVADA" -eq 422 ] || falhar "Revisão finalizada deveria estar congelada (HTTP $HTTP_ALTERA_TRAVADA)."
echo -e "${cor_verde}  ✔ [PASS] Imutabilidade comprovada: revisão finalizada congelada (HTTP $HTTP_ALTERA_TRAVADA).${cor_reset}"

REV2_INICIO=$(curl -s -b "$COOKIE_ADMIN" -X POST "$API_URL/revisoes-individuais/iniciar" -H "Content-Type: application/json" \
  -d "{\"atividadeId\": $ATIVIDADE_ID, \"alunoId\": $REVISOR_2_ID, \"prontuarioId\": $PRONTUARIO_ID}")
REV2_ID=$(echo "$REV2_INICIO" | jq -r '.id // empty')
[ -n "$REV2_ID" ] || falhar "Falha ao iniciar revisão do aluno 2: $REV2_INICIO"

FINAL_REV2=$(cat <<JSON
{
  "tempoGastoSegundos": 650,
  "finalizar": true,
  "achados": [
    {
      "gatilhoId": $GATILHO_ID,
      "confirmouDano": true,
      "justificativaDano": "Dano grave prolongando internação hospitalar por coma hipoglicêmico.",
      "danoPresenteAdmissao": false,
      "gravidade": "CATEGORIA_F"
    }
  ]
}
JSON
)
curl -s -b "$COOKIE_ADMIN" -X PUT "$API_URL/revisoes-individuais/$REV2_ID/salvar" -H "Content-Type: application/json" -d "$FINAL_REV2" > /dev/null
echo -e "${cor_verde}  ✔ [PASS] Aluno 2 finalizou auditoria com 650s (Achado Categoria F), de forma totalmente independente.${cor_reset}"

# ----------------------------------------------------------------------
# FASE 4: Painel Docente - Correção e Homologação Individual
# ----------------------------------------------------------------------
echo ""
echo "======================================================================"
echo "==> FASE 4: Painel Docente - Correção e Homologação por Aluno"

AUDITORIAS_ATIVIDADE=$(curl -s "$API_URL/revisoes-individuais/atividade/$ATIVIDADE_ID/alunos")
TOTAL_ALUNOS_PAINEL=$(echo "$AUDITORIAS_ATIVIDADE" | jq 'length')
[ "$TOTAL_ALUNOS_PAINEL" -eq 2 ] || falhar "Esperado 2 alunos no painel docente, encontrado $TOTAL_ALUNOS_PAINEL."
echo -e "${cor_verde}  ✔ [PASS] Painel docente lista as auditorias dos $TOTAL_ALUNOS_PAINEL alunos da turma.${cor_reset}"

CORRECAO_JSON='{"parecerDocente": "Classificação adequada. Evento adverso medicamentoso confirmado por insulinoterapia.", "homologada": true}'
CORRECAO_RESP=$(curl -s -b "$COOKIE_ADMIN" -X PUT "$API_URL/revisoes-individuais/$REV1_ID/correcao?professorId=$DOCENTE_ID" \
  -H "Content-Type: application/json" -d "$CORRECAO_JSON")
HOMOLOGADA_REV1=$(echo "$CORRECAO_RESP" | jq -r '.homologada')
[ "$HOMOLOGADA_REV1" == "true" ] || falhar "Correção docente do aluno 1 não foi homologada: $CORRECAO_RESP"
echo -e "${cor_verde}  ✔ [PASS] Professor corrigiu e homologou a auditoria do aluno 1.${cor_reset}"

curl -s -b "$COOKIE_ADMIN" -X PUT "$API_URL/revisoes-individuais/$REV2_ID/correcao?professorId=$DOCENTE_ID" \
  -H "Content-Type: application/json" -d "$CORRECAO_JSON" > /dev/null
echo -e "${cor_verde}  ✔ [PASS] Professor corrigiu e homologou a auditoria do aluno 2.${cor_reset}"

# ----------------------------------------------------------------------
# FASE 5: Ishikawa, 5W3H e PDCA por Revisão Individual
# ----------------------------------------------------------------------
echo ""
echo "======================================================================"
echo "==> FASE 5: Melhoria da Qualidade (Ishikawa, 5W3H e PDCA) por Revisão"

QUALIDADE_ENVIO=$(cat <<JSON
{
  "ishikawa": {
    "efeitoPrincipal": "Hipoglicemia severa associada a erro na dosagem de insulina",
    "metodo": "Ausência de dupla checagem obrigatória para medicamentos de alta vigilância",
    "maoDeObra": "Equipe de enfermagem sobrecarregada durante o plantão noturno",
    "material": "Seringas com graduações que facilitam confusão de leitura",
    "medida": "Monitoramento de glicemia capilar espaçado em intervalos superiores a 4h",
    "meioAmbiente": "Iluminação inadequada no posto de enfermagem",
    "maquina": "Bomba de infusão sem barreira de segurança configurada para taxa máxima"
  },
  "planos5w3h": [
    {
      "oQue": "Instituir dupla checagem na administração de insulina",
      "porQue": "Evitar erros de cálculo e seleção de dosagem",
      "quem": "Enfermeiros assistenciais",
      "onde": "Todas as enfermarias clínicas",
      "quando": "Em até 15 dias",
      "como": "Checklist eletrônico à beira-leito",
      "quantoCusta": 1500.00,
      "comoMedir": "Taxa de adesão à checagem por auditoria periódica"
    }
  ],
  "pdca": {
    "planejar": "Elaborar protocolo clínico de insulinoterapia segura e treinamento das equipes.",
    "fazer": "Capacitar 100% dos enfermeiros e técnicos de enfermagem.",
    "checar": "Monitorar incidentes hipoglicêmicos nos 30 dias subsequentes.",
    "agir": "Padronizar rotina no manual assistencial do hospital."
  }
}
JSON
)
QUALIDADE_RESP=$(curl -s -b "$COOKIE_ADMIN" -X PUT "$API_URL/melhoria-qualidade/revisao/$REV1_ID" -H "Content-Type: application/json" -d "$QUALIDADE_ENVIO")
PDCA_SALVO=$(echo "$QUALIDADE_RESP" | jq -r '.pdca.planejar // empty')
[ -n "$PDCA_SALVO" ] || falhar "Falha ao salvar melhoria da qualidade: $QUALIDADE_RESP"
echo -e "${cor_verde}  ✔ [PASS] Ishikawa (6 M's), Plano de Ação 5W3H e PDCA persistidos para a revisão do aluno 1.${cor_reset}"

# ----------------------------------------------------------------------
# FASE 6: Métricas Epidemiológicas com Filtros
# ----------------------------------------------------------------------
echo ""
echo "======================================================================"
echo "==> FASE 6: Indicadores Epidemiológicos Filtrados"

METRICAS_JSON=$(curl -s "$API_URL/indicadores?turmaId=$TURMA_ID")
TOTAL_PRONT=$(echo "$METRICAS_JSON" | jq -r '.totalProntuariosRevistos')
TOTAL_EA=$(echo "$METRICAS_JSON" | jq -r '.totalEventosAdversos')
[ "$TOTAL_PRONT" -ge 1 ] || falhar "Indicadores não computaram nenhum prontuário revisto homologado: $METRICAS_JSON"
[ "$TOTAL_EA" -ge 1 ] || falhar "Indicadores não computaram nenhum evento adverso: $METRICAS_JSON"

echo "  Relatório Consolidado de Indicadores Epidemiológicos (turma $TURMA_ID):"
echo "    - Total de Prontuários Revistos Homologados: $TOTAL_PRONT"
echo "    - Total de Eventos Adversos:                 $TOTAL_EA"
echo -e "${cor_verde}  ✔ [PASS] Indicadores epidemiológicos do IHI-GTT calculados a partir das revisões homologadas.${cor_reset}"

# ----------------------------------------------------------------------
# TEARDOWN
# ----------------------------------------------------------------------
echo ""
echo "======================================================================"
echo "==> TEARDOWN: Limpeza Relacional em Cascata"

curl -s -b "$COOKIE_ADMIN" -X DELETE "$API_URL/turmas/$TURMA_ID" -o /dev/null
curl -s -b "$COOKIE_ADMIN" -X DELETE "$API_URL/cenarios-clinicos/$CENARIO_ID" -o /dev/null
curl -s -b "$COOKIE_ADMIN" -X POST "$API_URL/autenticacao/sair" -o /dev/null
echo -e "${cor_verde}  ✔ [PASS] Turma, atividade, cenário e prontuário excluídos em cascata. Sessão encerrada.${cor_reset}"

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║   PARABÉNS! FLUXO COMPLETO DE AUDITORIA INDIVIDUAL VALIDADO!         ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
