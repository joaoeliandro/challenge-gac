# Carteira Financeira - Desafio Full Stack (Grupo Adriano Cobuccio)

Este repositório é a minha entrega para o desafio técnico proposto pelo Grupo Adriano Cobuccio: construir uma carteira financeira funcional, onde o usuário se cadastra, autentica, deposita e transfere saldo para outras pessoas, com possibilidade de reverter qualquer operação.

O desafio pedia, em resumo:

- Cadastro e autenticação de usuários
- Envio, recebimento e depósito de dinheiro
- Validação de saldo antes de transferir (e ajuste correto quando o saldo está negativo)
- Reversão de transferências e depósitos, seja por inconsistência ou a pedido do usuário

Abaixo explico o que entreguei, como rodar o projeto e as decisões que tomei ao longo do caminho. Boa parte delas eu pretendo justificar melhor durante a conversa técnica.

## Stack e por que escolhi cada peça

Usei **NestJS** no backend porque o desafio pedia domínio de arquitetura, e o Nest já impõe uma separação clara entre controller, service e module sem eu precisar inventar convenção própria. Isso facilitou aplicar o SOLID sem esforço extra onde cada module (auth, wallet, health, metrics) cuida só da sua responsabilidade.

Para persistência usei **PostgreSQL com Prisma**. O ponto principal foi o `$transaction`: débito e crédito de uma transferência acontecem dentro do mesmo bloco atômico, então não existe cenário onde um lado da operação seja aplicado e o outro não.

No frontend fui de **Next.js 14 com App Router e Server Actions** como no próprio desafio cita diferencial o Server Actions, então depósito, transferência e reversão chamam a API diretamente do servidor, sem precisar de uma camada extra de API routes no Next.

Autenticação é **JWT guardado em cookie httpOnly**, então o token nunca fica acessível via JavaScript no browser. O middleware do Next valida esse cookie antes de deixar a página renderizar.

Por fim, subo tudo com **Docker Compose** (API, web, Postgres, Prometheus e Grafana), tenho testes em **Vitest + Supertest** (unitários e de integração) e documentei a API com **Swagger**. Logs estruturados via **Winston**, com `traceId` por requisição, para conseguir rastrear uma operação de ponta a ponta.

## Como rodar

Pré-requisitos: Node 22+ e Docker rodando.

A forma mais rápida:

```bash
./setup.sh
```

O script instala as dependências da API e do web, sobe o Postgres via Docker, roda as migrations e popula o banco com usuários de teste.

Depois, em dois terminais:

```bash
cd apps/api && npm run start:dev   # http://localhost:3001
cd apps/web && npm run dev         # http://localhost:3000
```

Se preferir tudo dentro do Docker (API, web, Postgres, Prometheus e Grafana):

```bash
cp apps/api/.env.example apps/api/.env
# ajuste o JWT_SECRET antes de subir

docker compose up --build
cd apps/api && npm run db:migrate && npm run db:seed
```

| Serviço     | URL                                    |
|-------------|-----------------------------------------|
| Frontend    | http://localhost:3000                   |
| API/Swagger | http://localhost:3001/docs              |
| Prometheus  | http://localhost:9090                   |
| Grafana     | http://localhost:3002 (login admin/admin) |

## Usuários de teste

O seed já cria três contas para testar transferências sem precisar cadastrar nada na mão:

| Nome         | E-mail              | Senha    | Saldo inicial |
|--------------|----------------------|----------|----------------|
| Alice Silva  | alice@carteira.dev   | senha123 | R$ 1.000       |
| Bruno Costa  | bruno@carteira.dev   | senha123 | R$ 500         |
| Carla Mendes | carla@carteira.dev   | senha123 | R$ 0           |

## Endpoints principais

| Método | Rota                            | O que faz              | Precisa de login |
|--------|----------------------------------|-------------------------|-------------------|
| POST   | /auth/register                   | Cria conta               | Não               |
| POST   | /auth/login                      | Login                    | Não               |
| GET    | /auth/me                         | Retorna o usuário logado | Sim               |
| GET    | /wallet/balance                  | Consulta saldo           | Sim               |
| GET    | /wallet/transactions              | Histórico paginado       | Sim               |
| POST   | /wallet/deposit                  | Deposita                 | Sim               |
| POST   | /wallet/transfer                 | Transfere para outro usuário | Sim          |
| POST   | /wallet/reverse/:transactionId   | Reverte uma transação     | Sim               |
| GET    | /health                          | Health check              | Não               |
| GET    | /metrics                         | Métricas Prometheus       | Não               |

A documentação interativa (com exemplos de payload) está em `http://localhost:3001/docs` com a API no ar.

## Testes

```bash
cd apps/api && npm test          # unitários (Vitest)
cd apps/api && npm run test:cov  # com cobertura

# integração sobe um banco isolado na porta 5433
docker compose -f docker-compose.test.yml up -d
cd apps/api && npm run test:e2e
docker compose -f docker-compose.test.yml down
```

## Estrutura

```
challenge-gac/
├── apps/
│   ├── api/                  # NestJS
│   │   ├── prisma/           # schema, migrations, seed
│   │   └── src/
│   │       ├── auth/         # cadastro, login, JWT
│   │       ├── wallet/       # depósito, transferência, reversão
│   │       ├── health/
│   │       ├── metrics/      # Prometheus
│   │       └── prisma/
│   └── web/                  # Next.js
│       └── src/
│           ├── app/          # rotas (App Router)
│           ├── actions/      # Server Actions
│           └── components/
├── docker/                   # configs do Prometheus e Grafana
├── docker-compose.yml
└── docker-compose.test.yml   # banco isolado para os testes de integração
```

## Como resolvi os pontos centrais do desafio

**Atomicidade na transferência.** Débito do remetente, crédito do destinatário e criação do registro de transação acontecem dentro do mesmo `prisma.$transaction`. Se qualquer parte falhar, o Postgres desfaz tudo e não tem cenário de saldo debitado sem o crédito correspondente.

**Saldo negativo no depósito.** Não precisei tratar isso como caso especial: o depósito sempre soma o valor ao saldo atual (`balance + amount`), então se o saldo estiver negativo por algum motivo (por exemplo, após uma reversão), o depósito naturalmente reduz a dívida em vez de ignorar o saldo existente.

**Validação antes de transferir.** Comparo o saldo do remetente com o valor solicitado dentro da própria transação do banco, antes de qualquer update para evitar condição de corrida onde duas transferências simultâneas "passariam" pela validação ao mesmo tempo.

**Reversão idempotente.** Antes de reverter, checo se a transação já está `REVERSED` ou já tem uma reversão associada (`reversal !== null`). Chamar a rota duas vezes para a mesma transação não duplica o efeito e a segunda chamada retorna erro. A reversão também guarda o vínculo com a transação original (`reversedFromId`), então dá pra auditar a cadeia depois.

**Auto-transferência bloqueada.** Um usuário não pode "transferir" para a própria carteira é validado antes de nbater no banco.

**Eventos de domínio.** Depósito, transferência e reversão emitem eventos depois que a transação comita. Hoje só tenho um listener de auditoria/log reagindo a eles, mas a ideia foi deixar a porta aberta para, por exemplo, notificação por e-mail sem precisar bater no `WalletService`.

## O que eu mudaria se isso fosse para produção

Tive que cortar escopo em algum lugar para entregar dentro do prazo, então documento aqui o que sei que falta:

- Rate limiting nas rotas de auth e wallet (hoje não tem nenhuma proteção contra brute-force)
- Refresh token com rotação, em vez de um JWT de vida única
- Fila assíncrona (BullMQ ou similar) para notificações de transação, em vez de fazer tudo síncrono
- Paginação por cursor no histórico, ao invés de offset que fica mais barato conforme a tabela de transações cresce
- Separar leitura e escrita do histórico se o volume de transações justificar (CQRS), hoje não justifica
