# SIGEA-GTT

**Sistema Integrado de Gestão e Auditoria Clínica** — plataforma para auditoria retrospectiva de prontuários clínicos simulados usando a metodologia **IHI Global Trigger Tool (GTT)**, com gestão acadêmica de turmas, cenários clínicos e indicadores epidemiológicos.

Projeto acadêmico do DCOMP/UFS, com backend em **Spring Boot 4 (Java 21)** e frontend em **Angular 17** (standalone components, signals).

---

## Sumário

- [Arquitetura](#arquitetura)
- [Módulos do sistema](#módulos-do-sistema)
- [Requisitos](#requisitos)
- [Executando localmente](#executando-localmente)
- [Usuário administrador padrão](#usuário-administrador-padrão)
- [Teste automatizado ponta a ponta](#teste-automatizado-ponta-a-ponta)
- [Variáveis de ambiente do backend](#variáveis-de-ambiente-do-backend)
- [Deploy no Render](#deploy-no-render)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Limitações conhecidas](#limitações-conhecidas)

---

## Arquitetura

```
┌─────────────────────┐        HTTPS/JSON        ┌──────────────────────┐
│  Frontend Angular    │ ───────────────────────► │  Backend Spring Boot │
│  (Static Site)       │ ◄─────────────────────── │  (Web Service/Docker)│
└─────────────────────┘        Cookie de sessão   └───────────┬──────────┘
                                                                │
                                                                ▼
                                                     ┌──────────────────────┐
                                                     │  PostgreSQL (Render) │
                                                     └──────────────────────┘
```

- **Backend**: Spring Boot 4 (Java 21 LTS com Virtual Threads / Project Loom), Spring Data JPA, Spring Security (autenticação JWT via Bearer Token + sessão), Flyway, PostgreSQL.
- **Frontend**: Angular 17+ standalone, sem NgModules, com `signals` para estado reativo e `provideHttpClient(withFetch())`.
- **Autenticação**: login por e-mail institucional/senha; autenticação via Bearer Token JWT assinado com HMAC-SHA256 e sessão HTTP com cookie SameSite/Secure.
- **Autorização**: leituras (`GET /api/**`) são públicas; escritas (`POST`/`PUT`/`PATCH`/`DELETE`) exigem sessão autenticada.

---

## Módulos do sistema

Todos os módulos abaixo foram testados de ponta a ponta (via API real, banco PostgreSQL limpo) durante a preparação deste projeto para produção:

| Módulo                          | Funcionalidades testadas                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Autenticação**                | Login, primeiro acesso (troca de senha obrigatória), logout, bloqueio de escrita sem sessão                                                             |
| **Usuários**                    | Cadastro, edição, inativação/reativação, reset de senha, paginação, filtro por perfil/status                                                            |
| **Gatilhos & Módulos GTT**      | Cadastro/edição/exclusão de módulos e gatilhos, ativar/inativar, ordenação natural (C1, C2, ..., C10)                                                   |
| **Unidades Hospitalares**       | CRUD completo, ativar/inativar                                                                                                                          |
| **Turmas**                      | Cadastro, edição, matrícula/desmatrícula de alunos com busca textual, regra "apenas PROFESSOR pode ser responsável"                                     |
| **Cenários Clínicos**           | Cadastro/edição reutilizável entre turmas, regra "apenas PROFESSOR pode ser Professor Criador"                                                          |
| **Prontuários Simulados**       | Cadastro vinculado ao cenário (contexto), edição, exclusão                                                                                              |
| **Atividades de Auditoria**     | Cadastro vinculado à turma (contexto), encerramento, exclusão em cascata                                                                                |
| **Auditoria Individual**        | Início de revisão, rascunho, finalização, imutabilidade pós-finalização (sem duplas — cada aluno audita individualmente)                                |
| **Painel Docente**              | Listagem de auditorias por aluno, correção/parecer formativo, homologação                                                                               |
| **Melhoria da Qualidade**       | Ishikawa (6M's), Plano de Ação 5W3H, Ciclo PDCA — persistidos por revisão individual homologada                                                         |
| **Indicadores Epidemiológicos** | Cálculo de taxa de danos, frequência, prevalência e distribuição NCC MERP, com filtros por turma, período letivo, cenário, unidade e intervalo de datas |

> O sistema de **duplas de revisores e consenso duplo-cego foi completamente removido**. Toda auditoria é individual, com correção e homologação feitas diretamente pelo professor responsável pela turma.

---

## Requisitos

- Java 21
- Node.js 18+ e npm
- PostgreSQL 16 (local, container ou gerenciado)
- `curl` e `jq` (apenas para rodar o script de teste E2E)

---

## Executando localmente

### 1. Banco de dados

```bash
# Exemplo usando Podman/Docker
podman run -d --name sigea-postgres \
  -e POSTGRES_USER=sigea_admin \
  -e POSTGRES_PASSWORD=sigea_dev_password \
  -e POSTGRES_DB=sigea_gtt \
  -p 5432:5432 \
  docker.io/library/postgres:16-alpine
```

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

O Flyway aplica automaticamente `V1__ddl.sql` (schema) e `V2__dml.sql` (carga inicial: administrador seed, unidades, módulos e os 53 gatilhos oficiais IHI-GTT). O backend sobe em `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

O Angular CLI sobe em `http://localhost:4200` com proxy configurado (`proxy.conf.json`) para `/api` → `http://localhost:8080`.

---

## Usuário administrador padrão

Criado automaticamente pela migração `V2__dml.sql`:

- **E-mail:** `matheusaraujopereira@academico.ufs.br`
- **Senha:** `Sigea@123`

Em produção, **troque essa senha imediatamente após o primeiro deploy** usando a tela de primeiro acesso ou o endpoint de reset.

---

## Teste automatizado ponta a ponta

O script `super_teste_e2e.sh` valida, contra um backend real, o fluxo completo: autenticação, criação de usuários, turma, matrícula, cenário, prontuário, atividade, auditoria individual dos dois alunos, correção docente, melhoria da qualidade e indicadores — incluindo checagem de regras de negócio (apenas `PROFESSOR` pode ser responsável/criador) e de segurança (escrita sem sessão é bloqueada).

```bash
# Com o backend rodando em http://localhost:8080
chmod +x super_teste_e2e.sh
./super_teste_e2e.sh
```

---

## Variáveis de ambiente do backend

| Variável          | Padrão local            | Descrição                                      |
| ----------------- | ----------------------- | ---------------------------------------------- |
| `DB_HOST`         | `localhost`             | Host do PostgreSQL                             |
| `DB_PORT`         | `5432`                  | Porta do PostgreSQL                            |
| `DB_NAME`         | `sigea_gtt`             | Nome do banco                                  |
| `DB_USERNAME`     | `sigea_admin`           | Usuário do banco                               |
| `DB_PASSWORD`     | `sigea_dev_password`    | Senha do banco                                 |
| `FRONTEND_ORIGIN` | `http://localhost:4200` | Origem exata (com protocolo) permitida no CORS |
| `JPA_SHOW_SQL`    | `false`                 | Ativa/desativa log de SQL do Hibernate         |

O frontend usa `src/assets/runtime-config.js` para definir `window.__SIGEA_API_URL__` em tempo de execução (permite trocar a URL da API sem recompilar o Angular).

---

## Deploy no Render

O arquivo `render.yaml` na raiz do repositório é um **Blueprint** do Render e provisiona automaticamente, **sem cartão de crédito e 100% no plano gratuito** (`plan: free` já configurado no Blueprint para o backend e o banco):

1. **`sigea-gtt-db`** — banco PostgreSQL gerenciado (Free).
2. **`sigea-gtt-backend`** — Web Service Docker (usa `backend/Dockerfile`), com health check em `/actuator/health` (Free).
3. **`sigea-gtt-frontend`** — Static Site Angular, com a URL do backend injetada em tempo de build (Static Sites são gratuitos por padrão, não têm campo de plano).

### Passo a passo (deploy gratuito para homologação)

1. Faça commit e push do repositório (incluindo `render.yaml`) para o GitHub/GitLab.
2. Crie uma conta gratuita em [render.com](https://render.com) (não pede cartão de crédito para os planos Free).
3. No painel do Render, clique em **New +** → **Blueprint**.
4. Conecte sua conta do GitHub/GitLab e selecione o repositório `SIGEA-GTT`.
5. O Render lê o `render.yaml` e mostra os três recursos que serão criados, todos com plano **Free** pré-selecionado. Clique em **Apply**.
6. Aguarde: o Render provisiona o banco primeiro, depois builda e sobe o backend, depois builda o frontend estático já apontando para a URL pública do backend.
7. Acompanhe os logs de build do serviço `sigea-gtt-backend` até aparecer **Live** (o health check `/actuator/health` precisa responder `200`).
8. Acesse a URL do serviço `sigea-gtt-frontend` (algo como `https://sigea-gtt-frontend.onrender.com`).
9. Faça login com o administrador seed e **troque a senha padrão imediatamente**.

### Limitações do plano gratuito do Render (importante para homologação)

- **Backend "dorme" após ~15 minutos sem requisições.** A primeira requisição depois disso demora de 30 a 60 segundos para "acordar" o serviço (cold start) — normal, não é erro.
- **Banco PostgreSQL gratuito expira em 90 dias** após a criação e é apagado automaticamente pelo Render. Para uma homologação mais longa, anote a data de criação e recrie o Blueprint (ou faça backup/restauração) antes do vencimento.
- **750 horas gratuitas por mês**, compartilhadas entre todos os Web Services gratuitos da conta. Um único serviço rodando o mês inteiro cabe tranquilamente nesse limite.
- Não há domínio customizado nem SSL próprio no plano gratuito — você usa o subdomínio `*.onrender.com` (já vem com HTTPS).
- Se você **renomear** o serviço `sigea-gtt-frontend` no Blueprint, atualize também o valor fixo de `FRONTEND_ORIGIN` no serviço backend (usado para liberar o CORS), pois o Render atribui o domínio `https://<nome-do-serviço>.onrender.com`.
- As migrações Flyway rodam automaticamente na inicialização do backend — não é necessário rodar SQL manualmente no banco do Render.

---

## Estrutura de pastas

```
backend/
  src/main/java/br/ufs/dcomp/sigeagtt/
    configuracoes/     Segurança (CORS, sessão), beans globais
    controladores/      Controllers REST (@RestController)
    servicos/            Regras de negócio
    modelos/             Entidades JPA
    repositorios/        Spring Data JPA repositories
    transferencia/       DTOs de requisição/resposta
  src/main/resources/
    application.yml
    db/migration/        Flyway (V1 = schema, V2 = seed)
  Dockerfile

frontend/
  src/app/
    modulos/             Telas por domínio (administracao, docente, auditoria, indicadores, autenticacao)
    nucleo/              Serviços HTTP, guardas de rota, interceptores
    compartilhado/       Componentes e modelos reutilizáveis
  src/assets/runtime-config.js   URL da API em tempo de execução

render.yaml              Blueprint de deploy (banco + backend + frontend)
super_teste_e2e.sh       Teste de integração ponta a ponta via curl
```

---

## Limitações conhecidas

- O domínio de e-mail institucional é único (`@academico.ufs.br`) para todos os perfis (administrador, professor e aluno), não havendo diferenciação de domínio por perfil.
- Não há verificação de e-mail nem recuperação de senha por e-mail; o reset de senha é feito por um administrador autenticado.
- O plano gratuito do Render não garante alta disponibilidade nem backups automáticos do banco — para uso real em produção acadêmica, considere um plano pago.
