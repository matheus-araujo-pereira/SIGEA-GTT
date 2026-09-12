#!/usr/bin/env bash
# =============================================================================
# SIGEA-GTT: Restauração de Backup no Banco de Dados
# Uso: ./restore.sh <caminho_para_arquivo.sql[.gz]>
# =============================================================================
set -e

DIR_ATUAL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIR_DB="$(cd "$DIR_ATUAL/.." && pwd)"

if [ -z "$1" ]; then
    echo "✘ [ERRO] Informe o arquivo de backup a restaurar."
    echo "  Uso: $0 <caminho/arquivo.sql[.gz]>"
    exit 1
fi

ARQUIVO="$1"

if [ ! -f "$ARQUIVO" ]; then
    echo "✘ [ERRO] Arquivo não encontrado: $ARQUIVO"
    exit 1
fi

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
echo " [SIGEA-GTT] Restaurando Backup no Banco: $DB_NAME"
echo " -> Origem: $ARQUIVO"
echo "======================================================================"

if [[ "$ARQUIVO" == *.gz ]]; then
    gunzip -c "$ARQUIVO" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 > /dev/null
else
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$ARQUIVO" > /dev/null
fi

echo "✔ [SUCESSO] Restauração concluída com sucesso!"
echo "======================================================================"

