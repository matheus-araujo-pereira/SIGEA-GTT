#!/usr/bin/env bash
# =============================================================================
# SIGEA-GTT: Backup Completo do Banco de Dados (pg_dump compactado)
# =============================================================================
set -e

DIR_ATUAL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIR_DB="$(cd "$DIR_ATUAL/.." && pwd)"
DIR_BACKUPS="$DIR_DB/backups"

mkdir -p "$DIR_BACKUPS"

if [ -f "$DIR_DB/.env" ]; then
    export $(grep -v '^#' "$DIR_DB/.env" | xargs)
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-sigea_gtt}"
DB_USER="${DB_USER:-sigea_admin}"
export PGPASSWORD="${DB_PASSWORD:-sigea_dev_password}"

DATA_HORA=$(date +"%Y%m%d_%H%M%S")
ARQUIVO_BACKUP="$DIR_BACKUPS/backup_${DB_NAME}_${DATA_HORA}.sql.gz"

echo ""
echo "======================================================================"
echo " [SIGEA-GTT] Gerando Backup do Banco: $DB_NAME"
echo "======================================================================"
echo " -> Destino: $ARQUIVO_BACKUP"

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl | gzip > "$ARQUIVO_BACKUP"

TAMANHO=$(du -h "$ARQUIVO_BACKUP" | cut -f1)
echo "✔ [SUCESSO] Backup concluído com sucesso! Tamanho: $TAMANHO"
echo "======================================================================"

