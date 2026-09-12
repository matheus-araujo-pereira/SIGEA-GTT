# Ambiente de Produção (Go-Live)

Boas práticas de segurança, inicialização e manutenção do banco de dados em produção (ex: PostgreSQL no Render, AWS RDS ou Servidor Institucional).

---

## 1. Segurança e Diretrizes de Produção

1. **Nunca executar `seed-dev.sh` ou `seed-staging.sh` em produção**: Apenas o schema canônico e o `seed-prod.sh` devem ser aplicados.
2. **Troca Obrigatória da Senha de Administrador**: O usuário seed inicial `matheusaraujopereira@academico.ufs.br` deve ter sua senha trocada imediatamente após a primeira inicialização.
3. **SSL/TLS Obrigatório**: Em produção na nuvem (como Render ou RDS), garanta que conexões exijam SSL (`?sslmode=require`).
4. **Pool de Conexões**: O HikariCP do backend está dimensionado para o plano de produção (`maximum-pool-size: 10`, `minimum-idle: 2`).

---

## 2. Inicialização Oficial de Produção

Conecte-se com as credenciais administrativas do banco de produção:

```bash
export DB_HOST="dpg-xxx.oregon-postgres.render.com"
export DB_PORT="5432"
export DB_NAME="sigea_gtt_db"
export DB_USER="sigea_gtt_db_user"
export DB_PASSWORD="senha_gerada_producao"

# 1. Aplica o Schema DDL
./scripts/init-db.sh

# 2. Assegura a integridade das sementes de produção
./scripts/seed-prod.sh
```

---

## 3. Rotina de Backup e Recuperação em Desastre (Disaster Recovery)

### Geração de Backup

```bash
./scripts/backup.sh
```

### Restauração de Emergência

```bash
./scripts/restore.sh ./backups/backup_sigea_gtt_db_20260912_120000.sql.gz
```
