# veyra-server

> Backend API for Veyra — Express, TypeScript, Prisma, PostgreSQL, Socket.IO

## Prerequisites

- Node.js 20 LTS
- Docker & Docker Compose (for PostgreSQL)
- Firebase project with Auth enabled

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Run migrations
npm run db:migrate

# 5. Seed demo data
npm run db:seed

# 6. Start dev server
npm run dev
# Server runs at http://localhost:3001
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | TypeScript build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run tests with Vitest |
| `npm run format` | Format code with Prettier |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:deploy` | Deploy migrations (production) |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `FIREBASE_SERVICE_ACCOUNT` | Yes | — | Base64-encoded Firebase service account JSON |
| `CLIENT_ORIGIN` | Yes | — | Allowed CORS origin (client URL) |
| `LOG_LEVEL` | No | `info` | Pino log level |
| `GEMINI_API_KEY` | No | — | Gemini API key for AI reviews |

## Folder Structure

```
src/
├── server.ts           # Bootstrap: HTTP server, Socket.IO, cron, graceful shutdown
├── app.ts              # Express app: middleware stack, route mounting, error handler
├── config/             # Environment, Firebase, CORS, logger, constants
├── db/                 # Prisma client singleton
├── middleware/          # Auth, validation, rate limit, error handling
├── modules/            # Domain modules (auth, tasks, weekly, monthly, etc.)
├── jobs/               # Cron jobs (occurrences, rollover, lock, deadlines)
├── sockets/            # Socket.IO setup, rooms, emitters, events
├── routes/             # Route mounting, health checks
├── lib/                # Utilities (errors, async handler, pagination, time)
└── types/              # Type augmentations (express.d.ts)
```

## Architecture

```
routes → controller → service → repository → Prisma
```

- Controllers parse requests and format responses
- Services contain business logic
- Repositories are the only layer touching the database
- Cross-module calls go through services

See [Architecture docs](../docs/ARCHITECTURE.md) for details.
