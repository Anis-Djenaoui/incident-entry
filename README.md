# Incident Entry — Saisie de dossiers d'assurance

Application interne de saisie de dossiers d'incident d'assurance avec génération automatique de documents DOCX, sécurisée par une authentification adossée à **Alfresco ACS**.

## Architecture

```
incident_entry/
├── apps/
│   ├── backend/     # API Express.js + PostgreSQL + Knex
│   └── frontend/    # Interface Next.js 15
├── nginx/           # Reverse proxy (TLS, routage same-origin)
├── docker-compose.yml
├── package.json     # Monorepo npm workspaces
└── README.md
```

## Authentification

L'application **ne gère aucun mot de passe** et **ne duplique aucun utilisateur** :
Alfresco ACS est l'unique source d'identité.

### Principes de sécurité

- **Mots de passe** : jamais stockés. Servent uniquement à obtenir un ticket
  Alfresco via l'API Ticket.
- **Tickets Alfresco** : chiffrés en **AES-256-GCM** (`EncryptionService`) avant
  stockage, jamais exposés au frontend, jamais journalisés.
- **Sessions** : un token opaque aléatoire (256 bits) est émis ; seul son
  **SHA-256** est stocké (`session_hash`). Le token transite uniquement via un
  cookie **HttpOnly / Secure / SameSite=Strict** (`app_session`, durée 8 h).
- **Révocation** : `POST /api/auth/logout` marque la session `revoked` et
  supprime le cookie. L'inactivité au-delà de 8 h révoque automatiquement la
  session.
- **Brute-force** : `express-rate-limit` (5 tentatives / IP / 15 min → 429).
- **En-têtes HTTP** : `helmet` (CSP, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, HSTS).
- **CORS** : une seule origine autorisée (`CORS_ORIGIN`), `credentials: true`.
- **Reverse proxy** : `app.set('trust proxy', 1)` pour respecter
  `X-Forwarded-Proto` derrière Nginx.
- **Journalisation** (`pino`) : seuls les événements `login réussi`,
  `login échoué`, `logout` et `expiration de session` sont tracés. Les secrets
  (mots de passe, tickets, cookies, tokens) sont masqués (`redact`).

> Remarque : les tokens de session sont **opaques** (aléatoires + SHA-256 en
> base), et non des JWT. Aucune variable `JWT_SECRET` n'est donc nécessaire ;
> ce choix évite d'avoir à invalider des JWT côté serveur et rend la révocation
> immédiate.

### Workflow de connexion

1. Le frontend envoie `POST /api/auth/login` (`{ username, password }`).
2. Le backend appelle Alfresco `POST .../authentication/versions/1/tickets`.
3. Il récupère le profil via `GET .../people/-me-` (ticket en Basic Auth).
4. Il crée une session locale (ticket chiffré, hash du token, expiration).
5. Il renvoie **uniquement** un cookie HttpOnly. Le ticket n'est jamais exposé.

## Prérequis

- Node.js 20+
- PostgreSQL 14+
- npm 10+

## Installation

### 1. Cloner et installer les dépendances

```bash
cd incident_entry
npm install
```

### 2. Configurer PostgreSQL

Créer la base de données :

```sql
CREATE DATABASE incident_entry;
```

### 3. Configurer le backend

```bash
cp apps/backend/.env.example apps/backend/.env
```

Modifier `apps/backend/.env` :

```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/incident_entry
DOCUMENT_STORAGE_PATH=storage/generated-documents
DOCX_TEMPLATE_PATH=templates/incident-template.docx

# Fournisseur d'identité Alfresco ACS
ALFRESCO_BASE_URL=https://alfresco.company.com

# Sessions — clé AES-256 (32 octets) : openssl rand -hex 32
SESSION_ENCRYPTION_KEY=<64 caractères hexadécimaux>
SESSION_COOKIE_NAME=app_session
SESSION_DURATION_HOURS=8

# CORS : origine autorisée du frontend (jamais * en production)
CORS_ORIGIN=http://localhost:3000
```

Générer la clé de chiffrement :

```bash
openssl rand -hex 32
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Chaîne de connexion PostgreSQL |
| `ALFRESCO_BASE_URL` | URL de base de l'instance Alfresco ACS |
| `SESSION_ENCRYPTION_KEY` | Clé AES-256 (hex 64 car. ou base64 32 octets) |
| `SESSION_COOKIE_NAME` | Nom du cookie de session (`app_session`) |
| `SESSION_DURATION_HOURS` | Durée de session / inactivité max (heures) |
| `CORS_ORIGIN` | Origine autorisée (obligatoire) |

### 4. Ajouter le template DOCX

Placez votre fichier Word dans :

```
apps/backend/templates/incident-template.docx
```

Le chemin est configurable via `DOCX_TEMPLATE_PATH` dans `.env`.

Variables Docxtemplater à utiliser dans le document (délimiteurs `{{` et `}}`) :

- `{{numeroDossier}}`, `{{compagnie}}`, `{{dateSurvenance}}`, `{{immatriculation}}`
- `{{nomAssure}}`, `{{nomConducteur}}`, `{{nomTier}}`, `{{numeroCarteOrange}}`
- `{{dateEffet}}`, `{{dateEcheance}}`, `{{natureIncident}}`, `{{provision}}`

### 5. Exécuter les migrations

```bash
npm run migrate -w apps/backend
```

### 6. Configurer le frontend

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Démarrage

### Démarrer les deux applications

```bash
npm run dev
```

- Frontend : http://localhost:3000
- Backend : http://localhost:3001

### Démarrer séparément

```bash
# Backend
npm run dev:backend

# Frontend
npm run dev:frontend
```

## API

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/auth/login` | – | Connexion (Alfresco) → cookie de session |
| `POST` | `/api/auth/logout` | ✓ | Déconnexion + révocation de session |
| `GET` | `/api/auth/me` | ✓ | Utilisateur connecté (`username`, `displayName`) |
| `POST` | `/api/dossiers` | ✓ | Créer un dossier |
| `GET` | `/api/dossiers/:id` | ✓ | Récupérer un dossier |
| `GET` | `/api/documents/:id/download` | ✓ | Télécharger le document DOCX |
| `GET` | `/health` | – | Vérification de santé |

Les routes marquées `✓` exigent le cookie de session `app_session` (envoyé
automatiquement par le client Axios configuré avec `withCredentials: true`).

### Exemple de création

```bash
curl -X POST http://localhost:3001/api/dossiers \
  -H "Content-Type: application/json" \
  -d '{
    "numeroDossier": "DOS-2025-001",
    "compagnie": "CAAR",
    "dateSurvenance": "2025-06-01",
    "immatriculation": "AB-123-CD",
    "nomAssure": "Jean Dupont",
    "nomConducteur": "Jean Dupont",
    "nomTier": "Martin",
    "numeroCarteOrange": "123456789",
    "dateEffet": "2025-01-01",
    "dateEcheance": "2025-12-31",
    "natureIncident": "materiel",
    "provision": 1500.50
  }'
```

## Structure backend

```
apps/backend/src/
├── config/          # DB, environnement, logger (pino)
├── controllers/     # Contrôleurs HTTP (dossier, auth)
├── middlewares/     # Validation, auth, rate-limit, erreurs
├── repositories/    # Accès aux données (dossier, session)
├── routes/          # Routes Express
├── services/        # Métier, DOCX, Alfresco, sessions, chiffrement
├── types/           # DTOs et types TypeScript
└── utils/           # Helpers (cookies)
```

## Génération DOCX

Le service `DocumentGenerationService` utilise **Docxtemplater** et **PizZip** pour remplir le template placé dans `templates/incident-template.docx`.

Les documents générés sont stockés dans `storage/generated-documents/incident-{uuid}.docx`.

Pour modifier le modèle, éditez directement le fichier DOCX dans `apps/backend/templates/`.

## Scripts utiles

```bash
# Migrations
npm run migrate -w apps/backend
npm run migrate:rollback -w apps/backend

# Lint
npm run lint

# Build production
npm run build
```

## Production

```bash
# Backend
npm run build -w apps/backend
npm run start -w apps/backend

# Frontend
npm run build -w apps/frontend
npm run start -w apps/frontend
```

## Déploiement Docker

Architecture : **Nginx** route le frontend (`/`) et l'API (`/api`) sous un même
domaine. Le déploiement *same-origin* permet aux cookies `SameSite=Strict` de
fonctionner correctement.

```
Navigateur ──HTTP──▶ Nginx (:80) ─┬─▶ frontend (Next.js :3000)
                                  └─▶ backend  (Express :3001) ─▶ PostgreSQL
                                                     └──────────▶ Alfresco ACS
```

### 1. Configurer les variables

```bash
cp .env.example .env
```

Variables obligatoires dans `.env` :

| Variable | Exemple | Description |
|----------|---------|-------------|
| `SESSION_ENCRYPTION_KEY` | `openssl rand -hex 32` | Clé AES-256 pour chiffrer les tickets Alfresco |
| `ALFRESCO_BASE_URL` | `http://alfresco:8080` | URL de l'instance Alfresco ACS |
| `PUBLIC_APP_URL` | `http://192.168.1.26` | URL d'accès via Nginx (port 80) |
| `CORS_ORIGIN` | `http://192.168.1.26` | Doit correspondre exactement à l'origine du navigateur |

### 2. Démarrer

```bash
docker compose up -d --build
```

- Les migrations Knex sont exécutées automatiquement au démarrage du backend.
- L'application est accessible sur `http://<ip-serveur>` (port 80).
- Nginx attend que le backend et le frontend soient sains avant de démarrer.

### 3. Réinitialiser la base (si migrations corrompues)

```bash
docker compose down -v
docker compose up -d --build
```

> `-v` supprime le volume PostgreSQL. À utiliser uniquement si les migrations
> sont dans un état incohérent.

### 4. HTTPS en production

Décommenter le bloc HTTPS dans `nginx/nginx.conf`, monter les certificats dans
`nginx/certs/` et exposer le port 443 dans `docker-compose.yml`.

## Migrations

```bash
npm run migrate -w apps/backend          # applique toutes les migrations
npm run migrate:rollback -w apps/backend # annule la dernière migration
```

La table `user_sessions` est créée par la migration
`20250617000001_create_user_sessions.ts`.
