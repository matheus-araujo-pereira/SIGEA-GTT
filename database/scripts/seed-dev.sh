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
echo " [SIGEA-GTT] Aplicando Carga de Desenvolvimento / Simulação HU-UFS (2026)"
echo "======================================================================"

ARQUIVO_DEV="$DIR_DB/seeds/dev/01_dados_simulados.sql"

if [ ! -f "$ARQUIVO_DEV" ]; then
    echo "✘ [ERRO] Arquivo não encontrado: $ARQUIVO_DEV"
    exit 1
fi

echo " -> Executando simulação (Janeiro a Setembro de 2026 com Avaliações e Notas)..."

if command -v psql > /dev/null 2>&1; then
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$ARQUIVO_DEV"
elif command -v podman > /dev/null 2>&1; then
    podman exec -i sigea-postgres psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 < "$ARQUIVO_DEV"
elif command -v docker > /dev/null 2>&1; then
    docker exec -i sigea-postgres psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 < "$ARQUIVO_DEV"
else
    echo "✘ [ERRO] psql, podman ou docker não encontrados no PATH."
    exit 1
fi

echo ""
echo "✔ [SUCESSO] Carga de desenvolvimento de 2026 concluída com sucesso!"
echo "======================================================================"
