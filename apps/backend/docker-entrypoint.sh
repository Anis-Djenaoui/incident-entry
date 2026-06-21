#!/bin/sh
set -e

echo "[entrypoint] Attente de la base de données..."

until node -e "
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  client.connect()
    .then(() => client.end())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
" >/dev/null 2>&1; do
  sleep 2
done

echo "[entrypoint] Base de données disponible."
echo "[entrypoint] Exécution des migrations..."

npm run migrate

echo "[entrypoint] Démarrage du serveur..."
exec node dist/index.js
