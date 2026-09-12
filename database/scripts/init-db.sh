#!/usr/bin/env bash
# =============================================================================
# SIGEA-GTT: Inicialização Completa do Banco (DDL + Seeds Base)
# Executa: schemas/01_schema_completo.sql e seeds/base/*.sql
# =============================================================================
set -e

DIR_ATUAL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIR_DB="$(cd "$DIR_ATUAL/.." && pwd)"

# Carrega .env caso exista
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
echo " [SIGEA-GTT] Inicializando Banco de Dados: $DB_NAME ($DB_HOST:$DB_PORT)"
echo "======================================================================"

executar_sql() {
    local arquivo="$1"
    local descricao="$2"
    echo " -> Aplicando: $descricao ($(basename "$arquivo"))..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$arquivo" > /dev/null
}

# 1. Aplicar Schema DDL
executar_sql "$DIR_DB/schemas/01_schema_completo.sql" "Schema DDL Canônico (Tabelas e Índices)"

# 2. Aplicar Seeds Base (Essenciais para qualquer ambiente)
executar_sql "$DIR_DB/seeds/base/01_admin_inicial.sql" "Administrador Inicial"
executar_sql "$DIR_DB/seeds/base/02_unidades_hu.sql" "Unidades Hospitalares HU-UFS"
executar_sql "$DIR_DB/seeds/base/03_modulos_gatilhos.sql" "Módulos e 53 Gatilhos IHI-GTT"
executar_sql "$DIR_DB/seeds/base/04_categorias_eventos_adversos.sql" "Categorias de Eventos Adversos"

echo ""
echo "✔ [SUCESSO] Banco de dados inicializado com sucesso e pronto para uso!"
echo "======================================================================"

