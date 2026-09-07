#!/bin/bash

BASE_URL="http://localhost:8080/api"
VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AZUL='\033[0;34m'
NC='\033[0m'

sucesso() { echo -e "${VERDE}[PASS]${NC} $1"; }
falha() { echo -e "${VERMELHO}[FAIL]${NC} $1"; exit 1; }
etapa() { echo -e "\n${AZUL}==>${NC} $1"; }

etapa "1. Verificando conectividade com o Backend"
curl -s -f "$BASE_URL/usuarios" > /dev/null || falha "Backend offline em $BASE_URL."
sucesso "Backend operacional."

etapa "2. Selecionando Docente, Alunos e Unidade para a Sessão"
PROF_ID=$(curl -s "$BASE_URL/usuarios" | python3 -c "import sys, json; u = json.load(sys.stdin); print([x['id'] for x in u if x['perfil'] in ('PROFESSOR', 'ADMINISTRADOR') and x['ativo']][0])")
ALUNOS=$(curl -s "$BASE_URL/usuarios" | python3 -c "import sys, json; u = json.load(sys.stdin); print(','.join([str(x['id']) for x in u if x['perfil'] == 'ALUNO' and x['ativo']][:2]))")
ALUNO1_ID=$(echo "$ALUNOS" | cut -d',' -f1)
ALUNO2_ID=$(echo "$ALUNOS" | cut -d',' -f2)
UNIDADE_ID=$(curl -s "$BASE_URL/unidades" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")
GATILHO_ID=$(curl -s "$BASE_URL/gatilhos" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")

if [ -z "$ALUNO1_ID" ] || [ -z "$ALUNO2_ID" ]; then
  falha "São necessários ao menos 2 alunos ativos no banco para formar a dupla de teste."
fi
echo "   Docente: $PROF_ID | Revisor 1: $ALUNO1_ID | Revisor 2: $ALUNO2_ID | Gatilho ID: $GATILHO_ID"
sucesso "Atores da auditoria mapeados."

etapa "3. Preparando Turma, Enturmação e Cenário com Prontuário"
# Turma
TURMA_RES=$(curl -s -X POST "$BASE_URL/turmas" -H "Content-Type: application/json" \
  -d "{\"codigoDisciplina\":\"GTT-AUDIT-F3\",\"periodoLetivo\":\"2026.1\",\"anoSemestre\":\"2026/1\",\"professorResponsavelId\":$PROF_ID}")
TURMA_ID=$(echo "$TURMA_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$BASE_URL/turmas/$TURMA_ID/alunos/$ALUNO1_ID" > /dev/null
curl -s -X POST "$BASE_URL/turmas/$TURMA_ID/alunos/$ALUNO2_ID" > /dev/null

# Cenário
CENARIO_RES=$(curl -s -X POST "$BASE_URL/cenarios-clinicos" -H "Content-Type: application/json" \
  -d "{\"titulo\":\"Cenário Teste Auditoria F3\",\"descricaoPedagogica\":\"Avaliação de pistas e danos\",\"objetivosAprendizagem\":\"Metodologia IHI\",\"professorCriadorId\":$PROF_ID}")
CENARIO_ID=$(echo "$CENARIO_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

# Prontuário Simulado (5 seções)
PRONT_PAYLOAD=$(cat <<JSON
{
  "cenarioId": $CENARIO_ID,
  "unidadeHospitalarId": $UNIDADE_ID,
  "numeroAtendimento": "ATEND-TEST-F3",
  "idadePaciente": 68,
  "dataAdmissao": "2026-08-01",
  "dataAlta": "2026-08-08",
  "tempoPermanenciaDias": 7,
  "sumarioAlta": "Insuficiência cardíaca descompensada. Hipoglicemia medicamentosa.",
  "prescricoesMedicas": "Glibenclamida 5mg VO, Furosemida 40mg EV, Insulina NPH.",
  "examesLaboratoriais": "Glicemia capilar: 38 mg/dL. Creatinina: 1.4 mg/dL.",
  "relatorioCirurgico": "Não submetido a cirurgia.",
  "evolucoesMultiprofissionais": "Paciente confuso, sudorese profusa às 03h. Administrado Glicose 50% EV."
}
JSON
)
PRONT_RES=$(curl -s -X POST "$BASE_URL/prontuarios-simulados" -H "Content-Type: application/json" -d "$PRONT_PAYLOAD")
PRONT_ID=$(echo "$PRONT_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
sucesso "Cadeia acadêmica pronta. Turma: $TURMA_ID | Cenário: $CENARIO_ID | Prontuário: $PRONT_ID"

etapa "4. Criando Atividade de Auditoria e Dupla de Revisores"
ATIV_PAYLOAD=$(cat <<JSON
{
  "turmaId": $TURMA_ID,
  "cenarioId": $CENARIO_ID,
  "titulo": "Sessão Prática GTT - Teste Fase 3",
  "dataInicio": "2026-09-01T08:00:00",
  "dataFim": "2026-09-30T18:00:00",
  "tempoLimiteMinutos": 20
}
JSON
)
ATIV_RES=$(curl -s -X POST "$BASE_URL/atividades-auditoria" -H "Content-Type: application/json" -d "$ATIV_PAYLOAD")
ATIV_ID=$(echo "$ATIV_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

DUPLA_PAYLOAD="{\"atividadeId\":$ATIV_ID,\"alunoRevisor1Id\":$ALUNO1_ID,\"alunoRevisor2Id\":$ALUNO2_ID}"
DUPLA_RES=$(curl -s -X POST "$BASE_URL/duplas-revisores" -H "Content-Type: application/json" -d "$DUPLA_PAYLOAD")
DUPLA_ID=$(echo "$DUPLA_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
sucesso "Atividade ID $ATIV_ID criada e Dupla ID $DUPLA_ID associada."

etapa "5. Discente consulta Atividades Atribuídas (GET /api/revisoes-individuais/minhas-atividades)"
MINHAS_RES=$(curl -s "$BASE_URL/revisoes-individuais/minhas-atividades?alunoId=$ALUNO1_ID")
QTD_ATIV=$(echo "$MINHAS_RES" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
[ "$QTD_ATIV" -ge 1 ] || falha "Discente não encontrou atividades vinculadas."
sucesso "Atividade listada na visão discente do Revisor 1."

etapa "6. Inicializando a Revisão Individual do Prontuário (POST /iniciar)"
INI_RES=$(curl -s -X POST "$BASE_URL/revisoes-individuais/iniciar" -H "Content-Type: application/json" \
  -d "{\"duplaId\":$DUPLA_ID,\"alunoId\":$ALUNO1_ID,\"prontuarioId\":$PRONT_ID}")
REV_ID=$(echo "$INI_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
sucesso "Revisão individual iniciada no banco com ID: $REV_ID."

etapa "7. Salvando Rascunho com Cronômetro e Gatilho (PUT /{id}/salvar)"
RASCUNHO_PAYLOAD=$(cat <<JSON
{
  "tempoGastoSegundos": 480,
  "finalizar": false,
  "achados": [
    {
      "gatilhoId": $GATILHO_ID,
      "confirmouDano": true,
      "justificativaDano": "Hipoglicemia grave sintomática com necessidade de resgate endovenoso.",
      "danoPresenteAdmissao": false,
      "gravidade": "CATEGORIA_E"
    }
  ]
}
JSON
)
SALV_RES=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/revisoes-individuais/$REV_ID/salvar" \
  -H "Content-Type: application/json" -d "$RASCUNHO_PAYLOAD")
HTTP_CODE=$(echo "$SALV_RES" | tail -n1)
[ "$HTTP_CODE" -eq 200 ] || falha "Erro ao salvar rascunho. HTTP: $HTTP_CODE"
sucesso "Rascunho gravado: 8 minutos de revisão, 1 gatilho com Dano Categoria E (NCC MERP)."

etapa "8. Finalizando a Auditoria Individual do Aluno"
FIN_PAYLOAD=$(cat <<JSON
{
  "tempoGastoSegundos": 750,
  "finalizar": true,
  "achados": [
    {
      "gatilhoId": $GATILHO_ID,
      "confirmouDano": true,
      "justificativaDano": "Hipoglicemia severa decorrente de dosagem excessiva de sulfonilureia.",
      "danoPresenteAdmissao": false,
      "gravidade": "CATEGORIA_E"
    }
  ]
}
JSON
)
FIN_RES=$(curl -s -X PUT "$BASE_URL/revisoes-individuais/$REV_ID/salvar" \
  -H "Content-Type: application/json" -d "$FIN_PAYLOAD")
IS_FIN=$(echo "$FIN_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['finalizada'])")
[ "$IS_FIN" == "True" ] || falha "Auditoria não foi marcada como finalizada."
sucesso "Auditoria individual submetida e congelada com sucesso."

etapa "9. Verificando Bloqueio de Imutabilidade (Regra de Negócio Pós-Finalização)"
TENTATIVA_ALTERAR=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/revisoes-individuais/$REV_ID/salvar" \
  -H "Content-Type: application/json" -d "$RASCUNHO_PAYLOAD")
HTTP_CODE=$(echo "$TENTATIVA_ALTERAR" | tail -n1)
[ "$HTTP_CODE" -ge 400 ] || falha "O sistema permitiu alterar uma auditoria individual já finalizada!"
sucesso "Integridade confirmada: auditoria finalizada é estritamente imutável."

etapa "10. Limpeza dos Dados de Teste da Sessão"
curl -s -X DELETE "$BASE_URL/atividades-auditoria/$ATIV_ID" > /dev/null
curl -s -X DELETE "$BASE_URL/cenarios-clinicos/$CENARIO_ID" > /dev/null
curl -s -X DELETE "$BASE_URL/turmas/$TURMA_ID" > /dev/null
sucesso "Massa de teste descartada via cascade relacional."

echo -e "\n${VERDE}======================================================${NC}"
echo -e "${VERDE}  TODOS OS 10 TESTES DA FASE 3 PASSARAM COM SUCESSO!  ${NC}"
echo -e "${VERDE}======================================================${NC}\n"
