#!/bin/bash

BASE_URL="http://localhost:8080/api"
VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AZUL='\033[0;34m'
NC='\033[0m'

sucesso() { echo -e "${VERDE}[PASS]${NC} $1"; }
falha() { echo -e "${VERMELHO}[FAIL]${NC} $1"; exit 1; }
etapa() { echo -e "\n${AZUL}==>${NC} $1"; }

etapa "1. Conectando com Backend e Buscando Atores"
curl -s -f "$BASE_URL/usuarios" > /dev/null || falha "Backend indisponível em $BASE_URL."
PROF_ID=$(curl -s "$BASE_URL/usuarios" | python3 -c "import sys, json; u = json.load(sys.stdin); print([x['id'] for x in u if x['perfil'] in ('PROFESSOR', 'ADMINISTRADOR') and x['ativo']][0])")
ALUNOS=$(curl -s "$BASE_URL/usuarios" | python3 -c "import sys, json; u = json.load(sys.stdin); print(','.join([str(x['id']) for x in u if x['perfil'] == 'ALUNO' and x['ativo']][:2]))")
ALUNO1_ID=$(echo "$ALUNOS" | cut -d',' -f1)
ALUNO2_ID=$(echo "$ALUNOS" | cut -d',' -f2)
UNIDADE_ID=$(curl -s "$BASE_URL/unidades" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")
GATILHO_ID=$(curl -s "$BASE_URL/gatilhos" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")
sucesso "Atores identificados."

etapa "2. Preparando Cenário, Turma, Dupla e Consenso"
TURMA_RES=$(curl -s -X POST "$BASE_URL/turmas" -H "Content-Type: application/json" \
  -d "{\"codigoDisciplina\":\"GTT-F5\",\"periodoLetivo\":\"2026.1\",\"anoSemestre\":\"2026/1\",\"professorResponsavelId\":$PROF_ID}")
TURMA_ID=$(echo "$TURMA_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$BASE_URL/turmas/$TURMA_ID/alunos/$ALUNO1_ID" > /dev/null
curl -s -X POST "$BASE_URL/turmas/$TURMA_ID/alunos/$ALUNO2_ID" > /dev/null

CENARIO_RES=$(curl -s -X POST "$BASE_URL/cenarios-clinicos" -H "Content-Type: application/json" \
  -d "{\"titulo\":\"Cenário F5 Qualidade\",\"descricaoPedagogica\":\"Melhoria Contínua\",\"objetivosAprendizagem\":\"PDCA/Ishikawa\",\"professorCriadorId\":$PROF_ID}")
CENARIO_ID=$(echo "$CENARIO_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

PRONT_RES=$(curl -s -X POST "$BASE_URL/prontuarios-simulados" -H "Content-Type: application/json" \
  -d "{\"cenarioId\":$CENARIO_ID,\"unidadeHospitalarId\":$UNIDADE_ID,\"numeroAtendimento\":\"ATEND-F5\",\"idadePaciente\":65,\"dataAdmissao\":\"2026-08-01\",\"dataAlta\":\"2026-08-05\",\"tempoPermanenciaDias\":4,\"sumarioAlta\":\"Alta com EA\",\"prescricoesMedicas\":\"Prescrição inicial\",\"examesLaboratoriais\":\"Exames alterados\",\"relatorioCirurgico\":\"\",\"evolucoesMultiprofissionais\":\"Evoluções registradas\"}")
PRONT_ID=$(echo "$PRONT_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

ATIV_RES=$(curl -s -X POST "$BASE_URL/atividades-auditoria" -H "Content-Type: application/json" \
  -d "{\"turmaId\":$TURMA_ID,\"cenarioId\":$CENARIO_ID,\"titulo\":\"Auditoria F5\",\"dataInicio\":\"2026-09-01T08:00:00\",\"dataFim\":\"2026-09-30T18:00:00\",\"tempoLimiteMinutos\":20}")
ATIV_ID=$(echo "$ATIV_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

DUPLA_RES=$(curl -s -X POST "$BASE_URL/duplas-revisores" -H "Content-Type: application/json" \
  -d "{\"atividadeId\":$ATIV_ID,\"alunoRevisor1Id\":$ALUNO1_ID,\"alunoRevisor2Id\":$ALUNO2_ID}")
DUPLA_ID=$(echo "$DUPLA_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

CONSENSO_RES=$(curl -s "$BASE_URL/consensos-duplas/dupla/$DUPLA_ID/prontuario/$PRONT_ID")
CONSENSO_ID=$(echo "$CONSENSO_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
sucesso "Consenso base inicializado com ID $CONSENSO_ID."

etapa "3. Salvando Ciclo de Melhoria: Ishikawa, 5W3H e PDCA"
PAYLOAD_MELHORIA=$(cat <<JSON
{
  "ishikawa": {
    "efeitoPrincipal": "Sobredose inadvertida de sedativo com depressão respiratória (NCC MERP Categoria F)",
    "metodo": "Ausência de protocolo de titulação de dose",
    "maoDeObra": "Déficit de treinamento sobre aprazamento em UTI",
    "material": "Ampolas de concentração distinta com rotulagem semelhante",
    "medida": "Falta de conferência por dupla checagem",
    "meioAmbiente": "Iluminação inadequada no posto durante o plantão noturno",
    "maquina": "Bomba de infusão sem barreira de segurança de limite de dose"
  },
  "planos5w3h": [
    {
      "oQue": "Implantar dupla checagem obrigatória de medicamentos de alta vigilância",
      "porQue": "Reduzir risco de erros de dosagem e trocas de medicação",
      "quem": "Comissão de Farmácia e Enfermagem",
      "onde": "Unidades de Internação e UTI",
      "quando": "30 dias",
      "como": "Checklist eletrônico integrado ao prontuário",
      "quantoCusta": 1500.00,
      "comoMedir": "Taxa de adesão à dupla checagem auditada mensalmente"
    }
  ],
  "pdca": {
    "planejar": "Elaborar POP de checagem e treinar equipes de assistência",
    "fazer": "Executar piloto na Clínica Médica por 60 dias",
    "checar": "Auditar prontuários para verificar incidência de novos gatilhos M2/M4",
    "agir": "Padronizar institucionalmente e atualizar o manual de acolhimento"
  }
}
JSON
)

SALV_RES=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/melhoria-qualidade/consenso/$CONSENSO_ID" \
  -H "Content-Type: application/json" -d "$PAYLOAD_MELHORIA")
HTTP_CODE=$(echo "$SALV_RES" | tail -n1)
[ "$HTTP_CODE" -eq 200 ] || falha "Erro ao salvar ciclo de melhoria. HTTP: $HTTP_CODE"
sucesso "Ishikawa, 5W3H e PDCA persistidos."

etapa "4. Consultando Ciclo de Melhoria (GET /api/melhoria-qualidade/consenso/$CONSENSO_ID)"
GET_RES=$(curl -s "$BASE_URL/melhoria-qualidade/consenso/$CONSENSO_ID")
EFEITO=$(echo "$GET_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['ishikawa']['efeitoPrincipal'])")
TOTAL_5W3H=$(echo "$GET_RES" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['planos5w3h']))")
PDCA_P=$(echo "$GET_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['pdca']['planejar'])")

[ -n "$EFEITO" ] || falha "Efeito do Ishikawa não retornado."
[ "$TOTAL_5W3H" -eq 1 ] || falha "Plano 5W3H divergente."
[ -n "$PDCA_P" ] || falha "PDCA não retornado."
sucesso "Dados do ciclo de qualidade validados na recuperação."

etapa "5. Limpeza da Massa de Teste"
curl -s -X DELETE "$BASE_URL/atividades-auditoria/$ATIV_ID" > /dev/null
curl -s -X DELETE "$BASE_URL/cenarios-clinicos/$CENARIO_ID" > /dev/null
curl -s -X DELETE "$BASE_URL/turmas/$TURMA_ID" > /dev/null
sucesso "Massa limpa via cascade."

echo -e "\n${VERDE}======================================================${NC}"
echo -e "${VERDE}   TESTE DA FASE 5 (ISHIKAWA/5W3H/PDCA) APROVADO!      ${NC}"
echo -e "${VERDE}======================================================${NC}\n"
