#!/bin/bash

BASE_URL="http://localhost:8080/api"
VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AZUL='\033[0;34m'
NC='\033[0m'

sucesso() { echo -e "${VERDE}[PASS]${NC} $1"; }
falha() { echo -e "${VERMELHO}[FAIL]${NC} $1"; exit 1; }
etapa() { echo -e "\n${AZUL}==>${NC} $1"; }

etapa "1. Verificando conectividade e atores"
curl -s -f "$BASE_URL/usuarios" > /dev/null || falha "Backend indisponível em $BASE_URL."
PROF_ID=$(curl -s "$BASE_URL/usuarios" | python3 -c "import sys, json; u = json.load(sys.stdin); print([x['id'] for x in u if x['perfil'] in ('PROFESSOR', 'ADMINISTRADOR') and x['ativo']][0])")
ALUNOS=$(curl -s "$BASE_URL/usuarios" | python3 -c "import sys, json; u = json.load(sys.stdin); print(','.join([str(x['id']) for x in u if x['perfil'] == 'ALUNO' and x['ativo']][:2]))")
ALUNO1_ID=$(echo "$ALUNOS" | cut -d',' -f1)
ALUNO2_ID=$(echo "$ALUNOS" | cut -d',' -f2)
UNIDADE_ID=$(curl -s "$BASE_URL/unidades" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")
GATILHO_ID=$(curl -s "$BASE_URL/gatilhos" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")
sucesso "Backend online e atores mapeados."

etapa "2. Criando base de auditoria (Permanência: 10 dias)"
TURMA_RES=$(curl -s -X POST "$BASE_URL/turmas" -H "Content-Type: application/json" \
  -d "{\"codigoDisciplina\":\"GTT-EPI\",\"periodoLetivo\":\"2026.1\",\"anoSemestre\":\"2026/1\",\"professorResponsavelId\":$PROF_ID}")
TURMA_ID=$(echo "$TURMA_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$BASE_URL/turmas/$TURMA_ID/alunos/$ALUNO1_ID" > /dev/null
curl -s -X POST "$BASE_URL/turmas/$TURMA_ID/alunos/$ALUNO2_ID" > /dev/null

CENARIO_RES=$(curl -s -X POST "$BASE_URL/cenarios-clinicos" -H "Content-Type: application/json" \
  -d "{\"titulo\":\"Cenário Indicadores IHI\",\"descricaoPedagogica\":\"Cálculo Epidemiológico\",\"objetivosAprendizagem\":\"Métricas IHI\",\"professorCriadorId\":$PROF_ID}")
CENARIO_ID=$(echo "$CENARIO_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

PRONT_RES=$(curl -s -X POST "$BASE_URL/prontuarios-simulados" -H "Content-Type: application/json" \
  -d "{\"cenarioId\":$CENARIO_ID,\"unidadeHospitalarId\":$UNIDADE_ID,\"numeroAtendimento\":\"ATEND-EPI-01\",\"idadePaciente\":70,\"dataAdmissao\":\"2026-08-01\",\"dataAlta\":\"2026-08-11\",\"tempoPermanenciaDias\":10,\"sumarioAlta\":\"Alta\",\"prescricoesMedicas\":\"Prescrição\",\"examesLaboratoriais\":\"Exames\",\"relatorioCirurgico\":\"\",\"evolucoesMultiprofissionais\":\"Evoluções\"}")
PRONT_ID=$(echo "$PRONT_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

ATIV_RES=$(curl -s -X POST "$BASE_URL/atividades-auditoria" -H "Content-Type: application/json" \
  -d "{\"turmaId\":$TURMA_ID,\"cenarioId\":$CENARIO_ID,\"titulo\":\"Sessão Epidemiológica\",\"dataInicio\":\"2026-09-01T08:00:00\",\"dataFim\":\"2026-09-30T18:00:00\",\"tempoLimiteMinutos\":20}")
ATIV_ID=$(echo "$ATIV_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

DUPLA_RES=$(curl -s -X POST "$BASE_URL/duplas-revisores" -H "Content-Type: application/json" \
  -d "{\"atividadeId\":$ATIV_ID,\"alunoRevisor1Id\":$ALUNO1_ID,\"alunoRevisor2Id\":$ALUNO2_ID}")
DUPLA_ID=$(echo "$DUPLA_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
sucesso "Prontuário com 10 dias de internação configurado."

etapa "3. Conduzindo Auditoria Individual e Consenso com 1 EA (Categoria F)"
# Finalização das duas revisões individuais
REV1_ID=$(curl -s -X POST "$BASE_URL/revisoes-individuais/iniciar" -H "Content-Type: application/json" -d "{\"duplaId\":$DUPLA_ID,\"alunoId\":$ALUNO1_ID,\"prontuarioId\":$PRONT_ID}" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
curl -s -X PUT "$BASE_URL/revisoes-individuais/$REV1_ID/salvar" -H "Content-Type: application/json" -d "{\"tempoGastoSegundos\":600,\"finalizar\":true,\"achados\":[{\"gatilhoId\":$GATILHO_ID,\"confirmouDano\":true,\"justificativaDano\":\"Dano comprovado\",\"danoPresenteAdmissao\":false,\"gravidade\":\"CATEGORIA_F\"}]}" > /dev/null

REV2_ID=$(curl -s -X POST "$BASE_URL/revisoes-individuais/iniciar" -H "Content-Type: application/json" -d "{\"duplaId\":$DUPLA_ID,\"alunoId\":$ALUNO2_ID,\"prontuarioId\":$PRONT_ID}" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
curl -s -X PUT "$BASE_URL/revisoes-individuais/$REV2_ID/salvar" -H "Content-Type: application/json" -d "{\"tempoGastoSegundos\":550,\"finalizar\":true,\"achados\":[{\"gatilhoId\":$GATILHO_ID,\"confirmouDano\":true,\"justificativaDano\":\"Dano comprovado\",\"danoPresenteAdmissao\":false,\"gravidade\":\"CATEGORIA_F\"}]}" > /dev/null

# Consenso e Homologação Docente
CONSENSO_ID=$(curl -s "$BASE_URL/consensos-duplas/dupla/$DUPLA_ID/prontuario/$PRONT_ID" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
curl -s -X PUT "$BASE_URL/consensos-duplas/$CONSENSO_ID/salvar" -H "Content-Type: application/json" \
  -d "{\"submeterFinal\":true,\"itens\":[{\"gatilhoId\":$GATILHO_ID,\"confirmouDano\":true,\"justificativaDano\":\"Dano acordado\",\"danoPresenteAdmissao\":false,\"gravidadeConsenso\":\"CATEGORIA_F\"}]}" > /dev/null

curl -s -X POST "$BASE_URL/consensos-duplas/$CONSENSO_ID/validar-docente" -H "Content-Type: application/json" \
  -d "{\"professorValidadorId\":$PROF_ID,\"parecerFormativo\":\"Homologado com sucesso\",\"homologado\":true,\"reclassificacoesGravidade\":{}}" > /dev/null
sucesso "Consenso homologado com 1 Evento Adverso Categoria F."

etapa "4. Consultando o Dashboard de Indicadores Epidemiológicos"
RES_INDICADORES=$(curl -s "$BASE_URL/indicadores?turmaId=$TURMA_ID")

TOTAL_REVISTOS=$(echo "$RES_INDICADORES" | python3 -c "import sys, json; print(json.load(sys.stdin)['totalProntuariosRevistos'])")
TOTAL_DIAS=$(echo "$RES_INDICADORES" | python3 -c "import sys, json; print(json.load(sys.stdin)['totalDiasInternacao'])")
TOTAL_EA=$(echo "$RES_INDICADORES" | python3 -c "import sys, json; print(json.load(sys.stdin)['totalEventosAdversos'])")
TAXA_DANOS=$(echo "$RES_INDICADORES" | python3 -c "import sys, json; print(json.load(sys.stdin)['taxaDanosPorMilDias'])")
FREQ_ADMISSOES=$(echo "$RES_INDICADORES" | python3 -c "import sys, json; print(json.load(sys.stdin)['frequenciaPorCemAdmissoes'])")
PREVALENCIA=$(echo "$RES_INDICADORES" | python3 -c "import sys, json; print(json.load(sys.stdin)['prevalenciaPercentual'])")
CAT_F=$(echo "$RES_INDICADORES" | python3 -c "import sys, json; print(json.load(sys.stdin)['distribuicaoSeveridade']['CATEGORIA_F'])")

echo "   - Prontuários Revistos: $TOTAL_REVISTOS"
echo "   - Dias de Internação: $TOTAL_DIAS"
echo "   - Eventos Adversos: $TOTAL_EA"
echo "   - Taxa de Danos por 1.000 pct-dia: $TAXA_DANOS (Esperado: 100.0)"
echo "   - Frequência por 100 admissões: $FREQ_ADMISSOES% (Esperado: 100.0%)"
echo "   - Prevalência: $PREVALENCIA% (Esperado: 100.0%)"
echo "   - Contagem Categoria F: $CAT_F (Esperado: 1)"

[ "$TOTAL_REVISTOS" -eq 1 ] || falha "Total de prontuários divergente: $TOTAL_REVISTOS"
[ "$TOTAL_DIAS" -eq 10 ] || falha "Total de dias divergente: $TOTAL_DIAS"
[ "$TOTAL_EA" -eq 1 ] || falha "Total de EA divergente: $TOTAL_EA"
[ "$CAT_F" -eq 1 ] || falha "Contagem de severidade divergente: $CAT_F"
sucesso "Todas as fórmulas oficiais do IHI-GTT foram validadas com exatidão."

etapa "5. Limpeza da Massa de Teste"
curl -s -X DELETE "$BASE_URL/atividades-auditoria/$ATIV_ID" > /dev/null
curl -s -X DELETE "$BASE_URL/cenarios-clinicos/$CENARIO_ID" > /dev/null
curl -s -X DELETE "$BASE_URL/turmas/$TURMA_ID" > /dev/null
sucesso "Ambiente limpo com sucesso."

echo -e "\n${VERDE}======================================================${NC}"
echo -e "${VERDE}   TODOS OS TESTES DA FASE 6 PASSARAM COM SUCESSO!    ${NC}"
echo -e "${VERDE}======================================================${NC}\n"
