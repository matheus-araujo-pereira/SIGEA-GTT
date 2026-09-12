#!/usr/bin/env bash
# =============================================================================
# SIGEA-GTT: Reset Completo do Banco de Dados Local
# ATENÇÃO: Remove todas as tabelas e dados, recriando o schema do zero.
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
echo " [SIGEA-GTT] ⚠ ATENÇÃO: Resetando Banco de Dados Local: $DB_NAME"
echo "======================================================================"

if command -v psql > /dev/null 2>&1; then
    executar_c() {
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -c "$1" > /dev/null
    }
elif command -v podman > /dev/null 2>&1; then
    executar_c() {
        podman exec -i sigea-postgres psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -c "$1" > /dev/null
    }
elif command -v docker > /dev/null 2>&1; then
    executar_c() {
        docker exec -i sigea-postgres psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -c "$1" > /dev/null
    }
else
    echo "✘ [ERRO] psql, podman ou docker não encontrados no PATH."
    exit 1
fi

echo " -> Dropando schema público..."
executar_c "
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO \"$DB_USER\";
    GRANT ALL ON SCHEMA public TO public;
"

echo " -> Reaplicando Schema DDL e Seeds Base..."
"$DIR_ATUAL/init-db.sh"

echo ""
echo "✔ [SUCESSO] Banco de dados resetado e pronto com estrutura limpa!"
echo "======================================================================"
