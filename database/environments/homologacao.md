# Ambiente de Homologação (Staging / QA)

Procedimentos para inicialização, carga controlada e validação no ambiente de homologação do **SIGEA-GTT**.

---

## 1. Conexão com o Banco de Homologação

Defina as variáveis de ambiente ou utilize o arquivo `.env`:

```bash
export DB_HOST="homolog-db.ufs.br"
export DB_PORT="5432"
export DB_NAME="sigea_gtt_staging"
export DB_USER="sigea_staging_user"
export DB_PASSWORD="sua_senha_segura"
```

---

## 2. Inicialização do Schema e Sementes Base

```bash
# Aplica a estrutura de tabelas e catálogo IHI-GTT oficial
./scripts/init-db.sh
```

---

## 3. Aplicação dos Dados Controlados de Homologação

Aplica 1 professor, 1 turma com 10 alunos matriculados e 2 cenários clínicos com prontuários específicos para validação da equipe pedagógica:

```bash
./scripts/seed-staging.sh
```

---

## 4. Rotina de Backup Preventivo

Antes de qualquer migração ou alteração de regras de negócio:

```bash
./scripts/backup.sh
```

Os backups são gravados em formato compactado (`.sql.gz`) na pasta `database/backups/`.
