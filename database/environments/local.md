# Ambiente Local & Desenvolvimento (PostgreSQL)

Guia de configuração e comandos para rodar o banco de dados do **SIGEA-GTT** localmente.

---

## 1. Subindo o PostgreSQL via Docker Compose (Recomendado)

Na pasta `database/`, execute:

```bash
docker compose up -d
```

O container `sigea-gtt-postgres` subirá na porta `5432` com volume persistente chamado `sigea_gtt_postgres_data`.

Para verificar o status:

```bash
docker compose ps
docker compose logs -f
```

---

## 2. Inicializando o Banco do Zero

Após o container estar saudável (_healthy_), execute:

```bash
# Inicializa o schema DDL e as sementes fundamentais (Admin, Unidades, Gatilhos e Categorias)
./scripts/init-db.sh
```

---

## 3. Carregando Dados Simulados para Desenvolvimento

Para popular o banco com a simulação completa para testes acadêmicos (5 turmas, 250 alunos, cenários, prontuários e revisões):

```bash
./scripts/seed-dev.sh
```

---

## 4. Resetando o Banco Local

Se desejar apagar todas as tabelas e dados para recomeçar com o banco limpo:

```bash
./scripts/reset-db.sh
```

---

## 5. Parando o Container

```bash
docker compose down
# Ou para remover os volumes e limpar o disco:
docker compose down -v
```
