#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Wallet - Setup Inicial"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Env vars
if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env criado - defina um JWT_SECRET (mín. 16 caracteres) antes de rodar a API, mesmo localmente"
fi

# Instalar deps da API
echo ""
echo "-> Instalando dependências da API..."
cd apps/api && npm install && cd ../..

# Instalar deps do Web
echo ""
echo "-> Instalando dependências do Web..."
cd apps/web && npm install && cd ../..

# Subir banco via Docker
echo ""
echo "-> Subindo PostgreSQL..."
docker compose up -d postgres
echo "   Aguardando banco ficar saudável..."
sleep 5

# Migrations e Seed
echo ""
echo "-> Rodando migrations..."
cd apps/api && npm run db:migrate -- --name init && cd ../..

echo ""
echo "-> Rodando seed..."
cd apps/api && npm run db:seed && cd ../..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Setup concluído!"
echo ""
echo "  Rodar local:"
echo "  - API:    cd apps/api && npm run start:dev"
echo "  - Web:    cd apps/web && npm run dev"
echo ""
echo "  Rodar tudo no Docker:"
echo "  - docker compose up -d"
echo ""
echo "  URLs:"
echo "  - Web:     http://localhost:3000"
echo "  - Swagger: http://localhost:3001/docs"
echo "  - Grafana: http://localhost:3002 (admin/admin)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
