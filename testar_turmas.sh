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
curl -s -f "$BASE_URL/usuarios" > /dev/null || falha "Backend indisponível em $BASE_URL. Inicie o Spring Boot primeiro."
sucesso "Backend online."

etapa "2. Obtendo IDs de Professor e Aluno para o teste"
PROF_ID=$(curl -s "$BASE_URL/usuarios" | python3 -c "import sys, json; users = json.load(sys.stdin); profs = [u['id'] for u in users if u['perfil'] in ('PROFESSOR', 'ADMINISTRADOR') and u['ativo']]; print(profs[0] if profs else '')")
ALUNO_ID=$(curl -s "$BASE_URL/usuarios" | python3 -c "import sys, json; users = json.load(sys.stdin); alunos = [u['id'] for u in users if u['perfil'] == 'ALUNO' and u['ativo']]; print(alunos[0] if alunos else '')")

if [ -z "$PROF_ID" ] || [ -z "$ALUNO_ID" ]; then
  falha "É necessário ao menos um usuário PROFESSOR/ADMINISTRADOR e um ALUNO cadastrados para rodar o teste."
fi
echo "   Professor ID: $PROF_ID | Aluno ID: $ALUNO_ID"
sucesso "Usuários de teste identificados."

etapa "3. Cadastrando nova Turma (POST /api/turmas)"
PAYLOAD_CRIACAO=$(cat <<JSON
{
  "codigoDisciplina": "GTT-TEST-99",
  "periodoLetivo": "2026.1",
  "anoSemestre": "2026/1",
  "professorResponsavelId": $PROF_ID
}
JSON
)

RES_CRIACAO=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/turmas" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD_CRIACAO")

HTTP_CODE=$(echo "$RES_CRIACAO" | tail -n1)
CORPO=$(echo "$RES_CRIACAO" | head -n -1)

[ "$HTTP_CODE" -eq 201 ] || falha "Falha ao criar turma. Código HTTP: $HTTP_CODE | Resposta: $CORPO"
TURMA_ID=$(echo "$CORPO" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
sucesso "Turma cadastrada com sucesso! ID: $TURMA_ID"

etapa "4. Buscando Turma por ID (GET /api/turmas/$TURMA_ID)"
RES_GET=$(curl -s "$BASE_URL/turmas/$TURMA_ID")
DISC=$(echo "$RES_GET" | python3 -c "import sys, json; print(json.load(sys.stdin)['codigoDisciplina'])")
[ "$DISC" == "GTT-TEST-99" ] || falha "Código da disciplina divergente: $DISC"
sucesso "Turma consultada com código correto: $DISC"

etapa "5. Editando Turma (PUT /api/turmas/$TURMA_ID)"
PAYLOAD_EDICAO=$(cat <<JSON
{
  "codigoDisciplina": "GTT-TEST-EDITADA",
  "periodoLetivo": "2026.2",
  "anoSemestre": "2026/2",
  "professorResponsavelId": $PROF_ID
}
JSON
)

RES_PUT=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/turmas/$TURMA_ID" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD_EDICAO")
HTTP_CODE=$(echo "$RES_PUT" | tail -n1)
[ "$HTTP_CODE" -eq 200 ] || falha "Erro na edição. HTTP: $HTTP_CODE"
sucesso "Turma editada com sucesso."

etapa "6. Alternando Status Ativo/Inativo (PATCH /api/turmas/$TURMA_ID/alternar-status)"
RES_STATUS=$(curl -s -X PATCH "$BASE_URL/turmas/$TURMA_ID/alternar-status")
STATUS=$(echo "$RES_STATUS" | python3 -c "import sys, json; print(json.load(sys.stdin)['ativa'])")
[ "$STATUS" == "False" ] || falha "Esperado status False, retornado: $STATUS"
# Reativa para permitir matrículas
curl -s -X PATCH "$BASE_URL/turmas/$TURMA_ID/alternar-status" > /dev/null
sucesso "Status alternado com êxito."

etapa "7. Matriculando Aluno (POST /api/turmas/$TURMA_ID/alunos/$ALUNO_ID)"
RES_MAT=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/turmas/$TURMA_ID/alunos/$ALUNO_ID")
HTTP_CODE=$(echo "$RES_MAT" | tail -n1)
[ "$HTTP_CODE" -eq 201 ] || falha "Falha na matrícula. HTTP: $HTTP_CODE"
sucesso "Aluno ID $ALUNO_ID matriculado na Turma ID $TURMA_ID."

etapa "8. Validando Bloqueio de Matrícula Duplicada (Regra de Negócio)"
RES_DUP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/turmas/$TURMA_ID/alunos/$ALUNO_ID")
HTTP_CODE=$(echo "$RES_DUP" | tail -n1)
[ "$HTTP_CODE" -ge 400 ] || falha "O sistema permitiu matricular o mesmo aluno duas vezes!"
sucesso "Bloqueio de matrícula duplicada validado."

etapa "9. Listando Alunos da Turma (GET /api/turmas/$TURMA_ID/alunos)"
RES_ALUNOS=$(curl -s "$BASE_URL/turmas/$TURMA_ID/alunos")
TOTAL_ALUNOS=$(echo "$RES_ALUNOS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
[ "$TOTAL_ALUNOS" -eq 1 ] || falha "Esperado 1 aluno matriculado, encontrado: $TOTAL_ALUNOS"
sucesso "Lista de alunos confirmada: 1 aluno vinculado."

etapa "10. Desmatriculando Aluno (DELETE /api/turmas/$TURMA_ID/alunos/$ALUNO_ID)"
RES_DEL_ALUNO=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/turmas/$TURMA_ID/alunos/$ALUNO_ID")
HTTP_CODE=$(echo "$RES_DEL_ALUNO" | tail -n1)
[ "$HTTP_CODE" -eq 200 ] || falha "Falha ao desmatricular aluno. HTTP: $HTTP_CODE"
sucesso "Aluno desmatriculado com sucesso."

etapa "11. Excluindo a Turma de Teste (DELETE /api/turmas/$TURMA_ID)"
RES_DEL_TURMA=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/turmas/$TURMA_ID")
HTTP_CODE=$(echo "$RES_DEL_TURMA" | tail -n1)
[ "$HTTP_CODE" -eq 200 ] || falha "Falha ao excluir turma. HTTP: $HTTP_CODE"
sucesso "Turma de teste removida do banco."

etapa "12. Verificando Limpeza no PostgreSQL"
RES_FINAL=$(curl -s -w "\n%{http_code}" "$BASE_URL/turmas/$TURMA_ID")
HTTP_CODE=$(echo "$RES_FINAL" | tail -n1)
[ "$HTTP_CODE" -ge 400 ] || falha "Turma ainda existe no banco após exclusão!"
sucesso "Limpeza concluída com integridade relacional."

echo -e "\n${VERDE}======================================================${NC}"
echo -e "${VERDE}  TODOS OS TESTES DE TURMAS E ENTURMAÇÃO PASSARAM!    ${NC}"
echo -e "${VERDE}======================================================${NC}\n"
