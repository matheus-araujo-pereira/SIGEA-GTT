#!/usr/bin/env bash
# =============================================================================
# SIGEA-GTT: Carga de Sementes Oficiais de Produção (Go-Live)
# Executa: seeds/prod/01_seed_producao.sql
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
echo " [SIGEA-GTT] Aplicando Sementes de Produção em: $DB_NAME"
echo "======================================================================"

executar_sql() {
    local arquivo="$1"
    local descricao="$2"
    echo " -> Aplicando: $descricao ($(basename "$arquivo"))..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$arquivo" > /dev/null
}

executar_sql "$DIR_DB/seeds/base/01_admin_inicial.sql" "Administrador do Sistema"
executar_sql "$DIR_DB/seeds/base/02_unidades_hu.sql" "Unidades Assistenciais HU-UFS"
executar_sql "$DIR_DB/seeds/base/03_modulos_gatilhos.sql" "Catálogo 53 Gatilhos IHI-GTT"
executar_sql "$DIR_DB/seeds/base/04_categorias_eventos_adversos.sql" "Categorias de Eventos Adversos"

echo ""
echo "✔ [SUCESSO] Sementes oficiais de produção aplicadas com integridade total!"
echo "======================================================================"

