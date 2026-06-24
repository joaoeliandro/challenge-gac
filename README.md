# Carteira Financeira — Grupo Adriano Cobuccio

Aplicação full-stack de carteira financeira com transferências, depósitos e reversões.

## Stack

| Camada    | Tecnologia                          |
|-----------|-------------------------------------|
| Backend   | NestJS 10 + TypeScript              |
| Banco     | PostgreSQL 16 + Prisma 5            |
| Frontend  | Next.js 14 (App Router)             |
| Auth      | JWT (httpOnly cookie no frontend)   |
| Infra     | Docker + docker-compose             |
| Testes    | Jest (unit) + Supertest (integração)|
| Docs      | Swagger (`/docs`)                   |
| Logs      | Winston (JSON estruturado)          |

## Como rodar

### Opção 1 — Docker Compose (recomendado)

```bash
cp .env.example .env
docker-compose up
```

Acesse: http://localhost:3000

### Opção 2 — Local

```bash
# Pré-requisitos: Node 20+, PostgreSQL rodando
./setup.sh
```

Em terminais separados:
```bash
cd apps/api && npm run start:dev   # http://localhost:3001
cd apps/web && npm run dev         # http://localhost:3000
```

## Testes

```bash
# Unitários
cd apps/api && npm test

# Com cobertura
cd apps/api && npm run test:cov

# Integração (requer banco de teste)
docker-compose -f docker-compose.test.yml up -d
cd apps/api && npm run test:e2e
```

## Endpoints principais

| Método | Endpoint                        | Descrição              | Auth |
|--------|---------------------------------|------------------------|------|
| POST   | /auth/register                  | Criar conta            | ✗    |
| POST   | /auth/login                     | Login                  | ✗    |
| GET    | /carteira/balance                 | Consultar saldo        | ✓    |
| GET    | /carteira/transactions            | Histórico              | ✓    |
| POST   | /carteira/deposit                 | Depositar              | ✓    |
| POST   | /carteira/transfer                | Transferir             | ✓    |
| POST   | /carteira/reverse/:transactionId  | Reverter transação     | ✓    |

Documentação interativa: `http://localhost:3001/docs`

## Decisões técnicas

**Por que NestJS?**
Módulos com injeção de dependência nativa tornam o código testável sem boilerplate. O ecossistema (`@nestjs/jwt`, `@nestjs/swagger`, `nest-winston`) é maduro e consistente.

**Por que Prisma?**
Type-safety end-to-end entre schema e código. O `$transaction()` garante atomicidade — essencial para o débito/crédito simultâneo da transferência.

**Atomicidade nas transferências**
Todo débito + crédito roda dentro de um `prisma.$transaction()`. Se qualquer operação falhar, o Prisma faz rollback automático. Não há risco de saldo "somado num lado e não debitado no outro".

**Reversão idempotente**
Antes de reverter, verificamos `status === REVERSED || reversal !== null`. Chamadas duplicadas retornam `400` sem efeito colateral.

**JWT stateless + httpOnly cookie**
O token não é exposto ao JavaScript do browser (XSS mitigation). O middleware do Next.js valida o cookie antes de renderizar qualquer rota protegida.

**Server Actions (Next.js 14)**
Depósito, transferência e reversão usam Server Actions — eliminam uma camada de API route no frontend e aproveitam o cache/revalidação nativo do Next.js.

**Logs estruturados (Winston)**
Em produção, logs em JSON com `traceId`, `userId` e `operation` permitem rastrear uma requisição de ponta a ponta em qualquer sistema de observabilidade (Datadog, CloudWatch etc.).

## Usuários de teste (seed)

| Nome         | E-mail                 | Senha    | Saldo |
|--------------|------------------------|----------|-------|
| Alice Silva  | alice@carteira.dev     | senha123 | R$1000|
| Bruno Costa  | bruno@carteira.dev     | senha123 | R$500 |
| Carla Mendes | carla@carteira.dev     | senha123 | R$0   |
