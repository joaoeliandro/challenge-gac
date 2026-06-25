# Carteira Financeira - Grupo Adriano Cobuccio

Aplicação full-stack de carteira financeira com transferências, depósitos e reversões.

## Stack

| Camada          | Tecnologia                                       |
|-----------------|--------------------------------------------------|
| Backend         | NestJS 10 + TypeScript                           |
| Banco           | PostgreSQL 16 + Prisma 6                         |
| Frontend        | Next.js 14 (App Router + Server Actions)         |
| Auth            | JWT stateless (httpOnly cookie no browser)       |
| Infra           | Docker + docker-compose (dev e prod)             |
| Testes          | Jest (unit) + Supertest (integração)             |
| Docs            | Swagger (`/docs`)                                |
| Logs            | Winston (JSON estruturado com traceId)           |
| Observabilidade | Prometheus + Grafana                             |

---

## Como rodar

### Opção 1 - Local (recomendado para desenvolvimento)

Pré-requisitos: Node 22+, Docker rodando.

```bash
./setup.sh
```

O script instala dependências, sobe o PostgreSQL via Docker, roda migrations e seed automaticamente.

Em terminais separados:
```bash
cd apps/api && npm run start:dev   # http://localhost:3001
cd apps/web && npm run dev         # http://localhost:3000
```

### Opção 2 - Docker Compose completo

Sobe API, Web, PostgreSQL, Prometheus e Grafana:

```bash
cp apps/api/.env.example apps/api/.env
# Edite apps/api/.env e ajuste JWT_SECRET

docker compose up --build
```

Após subir, rode migrations e seed:
```bash
cd apps/api && npm run db:migrate && npm run db:seed
```

---

## URLs

| Serviço     | URL                                   |
|-------------|---------------------------------------|
| Frontend    | http://localhost:3000                 |
| API/Swagger | http://localhost:3001/docs            |
| Prometheus  | http://localhost:9090                 |
| Grafana     | http://localhost:3002 (admin / admin) |

---

## Testes

```bash
# Unitários
cd apps/api && npm test

# Com cobertura
cd apps/api && npm run test:cov

# Integração (sobe banco isolado na porta 5433)
docker compose -f docker-compose.test.yml up -d
cd apps/api && npm run test:e2e
docker compose -f docker-compose.test.yml down
```

---

## Endpoints

| Método | Endpoint                           | Descrição           | Auth |
|--------|------------------------------------|---------------------|------|
| POST   | /auth/register                     | Criar conta         | ✗    |
| POST   | /auth/login                        | Login               | ✗    |
| GET    | /auth/me                           | Usuário autenticado | ✓    |
| GET    | /wallet/balance                    | Consultar saldo     | ✓    |
| GET    | /wallet/transactions               | Histórico paginado  | ✓    |
| POST   | /wallet/deposit                    | Depositar           | ✓    |
| POST   | /wallet/transfer                   | Transferir          | ✓    |
| POST   | /wallet/reverse/:transactionId     | Reverter transação  | ✓    |
| GET    | /health                            | Health check        | ✗    |
| GET    | /metrics                           | Métricas Prometheus | ✗    |

Documentação interativa: `http://localhost:3001/docs`

---

## Estrutura do projeto

```
challenge-gac/
├── apps/
│   ├── api/                  # NestJS - backend
│   │   ├── prisma/           # Schema, migrations e seed
│   │   └── src/
│   │       ├── auth/         # Registro, login, JWT
│   │       ├── wallet/       # Depósito, transferência, reversão
│   │       ├── health/       # Health check
│   │       ├── metrics/      # Prometheus
│   │       └── prisma/       # PrismaService
│   └── web/                  # Next.js 14 - frontend
│       └── src/
│           ├── app/          # App Router (pages)
│           ├── actions/      # Server Actions
│           └── components/   # UI components
├── docker/                   # Prometheus e Grafana configs
├── docker-compose.yml        # Dev + observabilidade
├── docker-compose.prod.yml   # Produção
└── docker-compose.test.yml   # Banco isolado para testes
```

---

## Decisões técnicas

**Por que NestJS?**
Injeção de dependência nativa, módulos isolados e decorators declarativos tornam o código testável sem boilerplate. O ecossistema (`@nestjs/jwt`, `@nestjs/swagger`, `nest-winston`, `@nestjs/event-emitter`) cobre todos os requisitos sem friction.

**Por que Prisma 6?**
Type-safety end-to-end entre schema e código TypeScript. O `$transaction()` garante atomicidade real com débito e crédito dentro do mesmo bloco PostgreSQL, com rollback automático em caso de falha.

**Atomicidade nas transferências**
```typescript
return this.prisma.$transaction(async (tx) => {
  await tx.wallet.update({ where: { id: sender.id }, data: { balance: { decrement: amount } } });
  await tx.wallet.update({ where: { id: receiver.id }, data: { balance: { increment: amount } } });
  await tx.transaction.create({ data: { ... } });
});
```
Se qualquer operação falhar, o Prisma faz rollback automático. Impossível ter saldo debitado sem crédito correspondente.

**Reversão idempotente**
Antes de reverter, verificamos `status === REVERSED || reversal !== null`. Chamadas duplicadas retornam `400` sem efeito colateral. A transação de reversão aponta para a original via `reversedFromId`, criando trilha de auditoria.

**Validação de auto-transferência**
Transferência para o próprio usuário é rejeitada antes de qualquer IO com `SelfTransferException`.

**Eventos de domínio desacoplados**
O `WalletService` emite eventos (`DepositCompletedEvent`, `TransferCompletedEvent`, `TransactionReversedEvent`) após o commit da transação. O `TransactionAuditListener` e o `MetricsService` reagem independentemente sem acoplamento direto com o service.

**JWT stateless + httpOnly cookie**
O token não é exposto ao JavaScript do browser (mitigação de XSS). O middleware do Next.js valida o cookie antes de renderizar qualquer rota protegida.

**Server Actions (Next.js 14)**
Depósito, transferência e reversão usam Server Actions que eliminam uma camada de API route e usam `revalidatePath` para atualizar saldo sem refresh manual. Diferencial explicitamente pedido no desafio.

**Logs estruturados (Winston)**
Cada request recebe um `traceId` UUID. Logs em JSON com `traceId`, `userId` e `operation` permitem rastrear uma requisição de ponta a ponta em qualquer sistema de observabilidade.

**Observabilidade com Prometheus + Grafana**
Métricas expostas em `/metrics`: total de transações por tipo, volume financeiro movimentado, latência por endpoint, taxa de erros e heap do Node.js. Grafana provisionado automaticamente com datasource e dashboard pré-configurados.

---

## Usuários de teste (seed)

| Nome         | E-mail                 | Senha    | Saldo   |
|--------------|------------------------|----------|---------|
| Alice Silva  | alice@carteira.dev     | senha123 | R$1.000 |
| Bruno Costa  | bruno@carteira.dev     | senha123 | R$500   |
| Carla Mendes | carla@carteira.dev     | senha123 | R$0     |

---

## O que ficaria diferente em produção

- Rate limiting nos endpoints de auth e wallet (`@nestjs/throttler`)
- Refresh token com rotação para não expirar sessões
- Fila assíncrona (BullMQ) para notificações de transação por e-mail/push
- Soft delete nas transações onde registros financeiros nunca são deletados
- Cursor-based pagination no histórico (mais eficiente que offset para dados crescentes)
- Separação read/write models (CQRS) para escalar o histórico independentemente
