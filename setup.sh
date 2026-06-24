#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Carteira — Setup Inicial"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Variáveis de ambiente
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✓ .env criado — ajuste JWT_SECRET antes de rodar em produção"
fi

# 2. Instalar deps da API
echo ""
echo "→ Instalando dependências da API..."
cd apps/api && npm install && cd ../..

# 3. Instalar deps do Web
echo ""
echo "→ Instalando dependências do Web..."
cd apps/web && npm install && cd ../..

# 4. Subir banco via Docker
echo ""
echo "→ Subindo PostgreSQL..."
docker compose up -d postgres
echo "   Aguardando banco ficar saudável..."
sleep 5

# 5. Migrations + Seed
echo ""
echo "→ Rodando migrations..."
npx prisma migrate dev --name init --schema=./prisma/schema.prisma

echo ""
echo "→ Rodando seed..."
npx ts-node -e "require('./prisma/seed.ts')" 2>/dev/null || \
  npx ts-node prisma/seed.ts

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Setup concluído!"
echo ""
echo "  Próximos passos:"
echo "  → API:    cd apps/api && npm run start:dev"
echo "  → Web:    cd apps/web && npm run dev"
echo "  → Docker: docker-compose up"
echo "  → Docs:   http://localhost:3001/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
