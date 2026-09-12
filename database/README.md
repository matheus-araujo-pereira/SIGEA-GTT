# SIGEA-GTT — Módulo de Banco de Dados

Este diretório centraliza a arquitetura, schemas, sementes de dados (_seeds_), scripts de automação CLI e documentação para o banco de dados **PostgreSQL (16+)** do **SIGEA-GTT**.

O banco de dados foi completamente desacoplado da aplicação backend: o backend não insere dados automaticamente nem roda scripts de migração com comandos destrutivos. Todo o controle de inicialização, versionamento e população de dados é explícito e operacionalizado via comandos e scripts deste diretório.

---

## Estrutura de Pastas

```
database/
├── README.md                      # Este manual completo
├── docker-compose.yml             # Subida local do PostgreSQL em container
├── .env.example                   # Modelo de variáveis de conexão
│
├── schemas/                       # Definições estruturais de tabelas e índices (DDL)
│   └── 01_schema_completo.sql     # Schema canônico (PostgreSQL 16+)
│
├── seeds/                         # Dados iniciais por propósito e ambiente (DML)
│   ├── base/                      # Sementes obrigatórias em qualquer ambiente
│   │   ├── 01_admin_inicial.sql   # Usuário administrador seed
│   │   ├── 02_unidades_hu.sql     # Unidades hospitalares do HU-UFS
│   │   ├── 03_modulos_gatilhos.sql# 6 Módulos e 53 Gatilhos oficiais IHI-GTT
│   │   └── 04_categorias_eventos_adversos.sql # 5 Categorias de eventos adversos
│   ├── dev/                       # Carga simulada completa (desenvolvimento/demonstração)
│   │   └── 01_dados_simulados.sql # 5 turmas, 250 alunos, 15 cenários, 45 prontuários, 2.250 revisões
│   ├── staging/                   # Carga controlada para homologação
│   │   └── 01_dados_homologacao.sql # Cenários específicos para testes docentes
│   └── prod/                      # Sementes oficiais de produção
│       └── 01_seed_producao.sql   # Apenas dados essenciais e catálogo IHI-GTT
│
├── scripts/                       # Utilitários CLI executáveis
│   ├── init-db.sh                 # Inicializa DDL + Seeds Base
│   ├── seed-dev.sh                # Aplica carga de simulação para desenvolvimento
│   ├── seed-staging.sh            # Aplica carga de homologação
│   ├── seed-prod.sh               # Aplica sementes de produção
│   ├── reset-db.sh                # Limpa e recria o banco do zero
│   ├── backup.sh                  # Gera backup compactado .sql.gz com timestamp
│   └── restore.sh                 # Restaura arquivo de backup
│
└── environments/                  # Guias detalhados por ambiente
    ├── local.md                   # Guia de desenvolvimento local
    ├── homologacao.md             # Guia para ambiente de homologação
    └── producao.md                # Guia de segurança e boas práticas para produção
```

---

## Guia Rápido (Comandos Mais Usados)

### 1. Subir banco local no Docker

```bash
docker compose up -d
```

### 2. Inicializar tabelas e sementes base

```bash
./scripts/init-db.sh
```

### 3. Popular com dados simulados para desenvolvimento

```bash
./scripts/seed-dev.sh
```

### 4. Resetar o banco local (limpeza e recriação total)

```bash
./scripts/reset-db.sh
```

### 5. Fazer backup

```bash
./scripts/backup.sh
```

### 6. Restaurar backup

```bash
./scripts/restore.sh ./backups/backup_sigea_gtt_20260912_120000.sql.gz
```
