#!/usr/bin/env bash
# =============================================================================
# SIGEA-GTT: Carga de Dados de Desenvolvimento e Apresentação (HU-UFS)
# Executa: seeds/dev/01_dados_simulados.sql
# =============================================================================
set -e

DIR_ATUAL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIR_DB="$(cd "$DIR_ATUAL/.." && pwd)"

if [ -f "$DIR_DB/.env" ]; then
    export $(grep -v '^#' "$DIR_DB/.env" | xargs)
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-sigea_gtt}"
DB_USER="${DB_USER:-sigea_admin}"
export PGPASSWORD="${DB_PASSWORD:-sigea_dev_password}"

echo ""
echo "======================================================================"
echo " [SIGEA-GTT] Aplicando Carga de Desenvolvimento / Simulação HU-UFS"
echo "======================================================================"

ARQUIVO_DEV="$DIR_DB/seeds/dev/01_dados_simulados.sql"

if [ ! -f "$ARQUIVO_DEV" ]; then
    echo "✘ [ERRO] Arquivo não encontrado: $ARQUIVO_DEV"
    exit 1
fi

echo " -> Executando simulação (5 Turmas, 250 Alunos, 15 Cenários, 45 Prontuários, 2.250 Revisões)..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$ARQUIVO_DEV"

echo ""
echo "✔ [SUCESSO] Carga massiva de desenvolvimento concluída com sucesso!"
echo "======================================================================"

