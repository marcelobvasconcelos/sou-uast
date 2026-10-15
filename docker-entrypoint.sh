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

# Sincronizar o schema do Prisma com o banco
echo "Aplicando schema do banco de dados (Prisma)..."
npx prisma db push --skip-generate

# Executar Seed para garantir Admin, Editor, Notícias, Menu e Configurações
echo "Executando Seed inicial do portal..."
node prisma/seed.js

echo "Iniciando servidor Next.js em produção na porta 3000..."
exec node server.js
