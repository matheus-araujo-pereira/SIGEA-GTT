#!/usr/bin/env bash
# =============================================================================
# SIGEA-GTT: Carga de Dados para Homologação / Testes Pedagógicos (Staging)
# Executa: seeds/staging/01_dados_homologacao.sql
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
echo " [SIGEA-GTT] Aplicando Carga Controlada de Homologação (Staging)"
echo "======================================================================"

ARQUIVO_STAGING="$DIR_DB/seeds/staging/01_dados_homologacao.sql"

if [ ! -f "$ARQUIVO_STAGING" ]; then
    echo "✘ [ERRO] Arquivo não encontrado: $ARQUIVO_STAGING"
    exit 1
fi

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$ARQUIVO_STAGING"

echo ""
echo "✔ [SUCESSO] Sementes de homologação aplicadas com sucesso!"
echo "======================================================================"

