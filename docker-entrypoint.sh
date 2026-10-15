#!/bin/sh
set -e

echo "=== SOU+UAST - Inicializando Aplicação ==="

# Aguardar PostgreSQL estar disponível
echo "Aguardando banco de dados PostgreSQL..."
until nc -z -v -w30 db 5432; do
  echo "Aguardando porta 5432 do PostgreSQL no host 'db'..."
  sleep 2
done
echo "PostgreSQL conectado com sucesso!"

# Garantir permissões de escrita no diretório de uploads
echo "Verificando diretório e permissões de uploads (/app/uploads)..."
mkdir -p /app/uploads
chmod 775 /app/uploads || true

# 1. Executar migrations do banco de dados (Prisma migrate deploy)
echo "Aplicando migrations pendentes (npx prisma migrate deploy)..."
if ! npx prisma migrate deploy; then
  echo "Aviso: prisma migrate deploy detectou banco preexistente sem baseline. Marcando migrations conhecidas..."
  npx prisma migrate resolve --applied 20261014_add_team_members || true
  npx prisma migrate deploy || true
fi

# 2. Sincronizar o schema do Prisma com o banco (garantia de alinhamento)
echo "Sincronizando schema do Prisma..."
npx prisma db push --skip-generate

# 3. Executar Seed para garantir Admin, Editor, Notícias, Menu e Configurações
echo "Executando Seed inicial do portal..."
node prisma/seed.js

echo "Iniciando servidor Next.js em produção na porta 3000..."
exec node server.js
