#!/bin/bash

BASE_URL="http://localhost:8080/api"
VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AZUL='\033[0;34m'
NC='\033[0m'

sucesso() { echo -e "${VERDE}[PASS]${NC} $1"; }
falha() { echo -e "${VERMELHO}[FAIL]${NC} $1"; exit 1; }
etapa() { echo -e "\n${AZUL}==>${NC} $1"; }

etapa "1. Conectando com o Backend e Identificando Atores"
curl -s -f "$BASE_URL/usuarios" > /dev/null || falha "Backend indisponível em $BASE_URL. Inicie o Spring Boot com ./mvnw spring-boot:run antes de executar."

PROF_ID=$(curl -s "$BASE_URL/usuarios" | python3 -c "import sys, json; u = json.load(sys.stdin); print([x['id'] for x in u if x['perfil'] in ('PROFESSOR', 'ADMINISTRADOR') and x['ativo']][0])")
ALUNOS=$(curl -s "$BASE_URL/usuarios" | python3 -c "import sys, json; u = json.load(sys.stdin); print(','.join([str(x['id']) for x in u if x['perfil'] == 'ALUNO' and x['ativo']][:2]))")
ALUNO1_ID=$(echo "$ALUNOS" | cut -d',' -f1)
ALUNO2_ID=$(echo "$ALUNOS" | cut -d',' -f2)
UNIDADE_ID=$(curl -s "$BASE_URL/unidades" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")
GATILHO_ID=$(curl -s "$BASE_URL/gatilhos" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")

if [ -z "$ALUNO1_ID" ] || [ -z "$ALUNO2_ID" ]; then
  falha "São necessários ao menos 2 alunos cadastrados e ativos."
fi

echo "   Docente: $PROF_ID | Revisor 1: $ALUNO1_ID | Revisor 2: $ALUNO2_ID | Gatilho: $GATILHO_ID"
sucesso "Atores mapeados."

etapa "2. Preparando Cenário, Prontuário, Turma e Dupla"
TURMA_RES=$(curl -s -X POST "$BASE_URL/turmas" -H "Content-Type: application/json" \
  -d "{\"codigoDisciplina\":\"GTT-F4\",\"periodoLetivo\":\"2026.1\",\"anoSemestre\":\"2026/1\",\"professorResponsavelId\":$PROF_ID}")
TURMA_ID=$(echo "$TURMA_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$BASE_URL/turmas/$TURMA_ID/alunos/$ALUNO1_ID" > /dev/null
curl -s -X POST "$BASE_URL/turmas/$TURMA_ID/alunos/$ALUNO2_ID" > /dev/null

CENARIO_RES=$(curl -s -X POST "$BASE_URL/cenarios-clinicos" -H "Content-Type: application/json" \
  -d "{\"titulo\":\"Cenário F4 Consenso\",\"descricaoPedagogica\":\"Consenso Dupla\",\"objetivosAprendizagem\":\"IHI\",\"professorCriadorId\":$PROF_ID}")
CENARIO_ID=$(echo "$CENARIO_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

PRONT_PAYLOAD=$(cat <<JSON
{
  "cenarioId": $CENARIO_ID,
  "unidadeHospitalarId": $UNIDADE_ID,
  "numeroAtendimento": "ATEND-F4-TEST",
  "idadePaciente": 72,
  "dataAdmissao": "2026-08-10",
  "dataAlta": "2026-08-15",
  "tempoPermanenciaDias": 5,
  "sumarioAlta": "Pneumonia nosocomial e insuficiência renal aguda.",
  "prescricoesMedicas": "Vancomicina 1g EV 12/12h.",
  "examesLaboratoriais": "Creatinina subiu de 0.9 para 2.6 mg/dL.",
  "relatorioCirurgico": "",
  "evolucoesMultiprofissionais": "Oligúria nas últimas 24 horas."
}
JSON
)
PRONT_RES=$(curl -s -X POST "$BASE_URL/prontuarios-simulados" -H "Content-Type: application/json" -d "$PRONT_PAYLOAD")
PRONT_ID=$(echo "$PRONT_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

ATIV_PAYLOAD="{\"turmaId\":$TURMA_ID,\"cenarioId\":$CENARIO_ID,\"titulo\":\"Auditoria Consenso F4\",\"dataInicio\":\"2026-09-01T08:00:00\",\"dataFim\":\"2026-09-30T18:00:00\",\"tempoLimiteMinutos\":20}"
ATIV_RES=$(curl -s -X POST "$BASE_URL/atividades-auditoria" -H "Content-Type: application/json" -d "$ATIV_PAYLOAD")
ATIV_ID=$(echo "$ATIV_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

DUPLA_RES=$(curl -s -X POST "$BASE_URL/duplas-revisores" -H "Content-Type: application/json" \
  -d "{\"atividadeId\":$ATIV_ID,\"alunoRevisor1Id\":$ALUNO1_ID,\"alunoRevisor2Id\":$ALUNO2_ID}")
DUPLA_ID=$(echo "$DUPLA_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
sucesso "Ambiente acadêmico configurado."

etapa "3. Executando Auditorias Individuais dos Dois Revisores"
# Revisor 1
REV1_RES=$(curl -s -X POST "$BASE_URL/revisoes-individuais/iniciar" -H "Content-Type: application/json" \
  -d "{\"duplaId\":$DUPLA_ID,\"alunoId\":$ALUNO1_ID,\"prontuarioId\":$PRONT_ID}")
REV1_ID=$(echo "$REV1_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
curl -s -X PUT "$BASE_URL/revisoes-individuais/$REV1_ID/salvar" -H "Content-Type: application/json" \
  -d "{\"tempoGastoSegundos\":600,\"finalizar\":true,\"achados\":[{\"gatilhoId\":$GATILHO_ID,\"confirmouDano\":true,\"justificativaDano\":\"Nefrotoxicidade por antimicrobiano\",\"danoPresenteAdmissao\":false,\"gravidade\":\"CATEGORIA_E\"}]}" > /dev/null

# Revisor 2
REV2_RES=$(curl -s -X POST "$BASE_URL/revisoes-individuais/iniciar" -H "Content-Type: application/json" \
  -d "{\"duplaId\":$DUPLA_ID,\"alunoId\":$ALUNO2_ID,\"prontuarioId\":$PRONT_ID}")
REV2_ID=$(echo "$REV2_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
curl -s -X PUT "$BASE_URL/revisoes-individuais/$REV2_ID/salvar" -H "Content-Type: application/json" \
  -d "{\"tempoGastoSegundos\":720,\"finalizar\":true,\"achados\":[{\"gatilhoId\":$GATILHO_ID,\"confirmouDano\":true,\"justificativaDano\":\"Lesão renal aguda induzida por fármaco\",\"danoPresenteAdmissao\":false,\"gravidade\":\"CATEGORIA_F\"}]}" > /dev/null
sucesso "Revisões individuais finalizadas pelos dois alunos."

etapa "4. Abrindo Sessão de Consenso e Conferindo Duplo-Cego"
CONSENSO_RES=$(curl -s "$BASE_URL/consensos-duplas/dupla/$DUPLA_ID/prontuario/$PRONT_ID")
CONSENSO_ID=$(echo "$CONSENSO_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
REV1_FIN=$(echo "$CONSENSO_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['comparativo']['revisor1Finalizou'])")
REV2_FIN=$(echo "$CONSENSO_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['comparativo']['revisor2Finalizou'])")
[ "$REV1_FIN" == "True" ] && [ "$REV2_FIN" == "True" ] || falha "Comparativo não refletiu as revisões finalizadas."
sucesso "Consenso ID $CONSENSO_ID aberto com espelho dos dois revisores."

etapa "5. Submetendo a Planilha Unificada de Consenso da Dupla"
SUBMETER_PAYLOAD=$(cat <<JSON
{
  "submeterFinal": true,
  "itens": [
    {
      "gatilhoId": $GATILHO_ID,
      "confirmouDano": true,
      "justificativaDano": "Acordo da dupla: Lesão renal aguda por vancomicina com prolongamento de internação.",
      "danoPresenteAdmissao": false,
      "gravidadeConsenso": "CATEGORIA_F"
    }
  ]
}
JSON
)
SUB_RES=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/consensos-duplas/$CONSENSO_ID/salvar" \
  -H "Content-Type: application/json" -d "$SUBMETER_PAYLOAD")
HTTP_CODE=$(echo "$SUB_RES" | tail -n1)
[ "$HTTP_CODE" -eq 200 ] || falha "Erro ao submeter consenso. HTTP: $HTTP_CODE"
sucesso "Planilha de consenso submetida com Dano Categoria F."

etapa "6. Validação e Homologação Docente (Papel do Revisor Médico)"
VALID_PAYLOAD=$(cat <<JSON
{
  "professorValidadorId": $PROF_ID,
  "parecerFormativo": "Excelente identificação da nefrotoxicidade e raciocínio adequado na classificação da severidade.",
  "homologado": true,
  "reclassificacoesGravidade": {}
}
JSON
)
HOMOLOG_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/consensos-duplas/$CONSENSO_ID/validar-docente" \
  -H "Content-Type: application/json" -d "$VALID_PAYLOAD")
HTTP_CODE=$(echo "$HOMOLOG_RES" | tail -n1)
[ "$HTTP_CODE" -eq 200 ] || falha "Erro ao homologar consenso. HTTP: $HTTP_CODE"
HOMOLOGADO=$(echo "$HOMOLOG_RES" | head -n -1 | python3 -c "import sys, json; print(json.load(sys.stdin)['validacao']['homologado'])")
[ "$HOMOLOGADO" == "True" ] || falha "Consenso não foi homologado."
sucesso "Validação docente gravada e danos chancelados."

etapa "7. Limpeza dos Registros de Teste"
curl -s -X DELETE "$BASE_URL/atividades-auditoria/$ATIV_ID" > /dev/null
curl -s -X DELETE "$BASE_URL/cenarios-clinicos/$CENARIO_ID" > /dev/null
curl -s -X DELETE "$BASE_URL/turmas/$TURMA_ID" > /dev/null
sucesso "Massa de teste limpa com sucesso."

echo -e "\n${VERDE}======================================================${NC}"
echo -e "${VERDE}   TESTE DA FASE 4 (CONSENSO E VALIDAÇÃO) APROVADO!   ${NC}"
echo -e "${VERDE}======================================================${NC}\n"
