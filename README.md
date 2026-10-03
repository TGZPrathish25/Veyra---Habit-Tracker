# Veyra — Build your day. Track your growth.

Veyra is a full-stack habit tracking application with gamification, social features, and analytics. It helps users build daily routines, set weekly plans and monthly goals, and track progress over time.

## Architecture

This repository contains two independent, separately deployable projects:

| Project | Path | Stack | Deploy Target |
|---------|------|-------|---------------|
| **Frontend** | [`veyra-client/`](./veyra-client/) | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion | Vercel / Netlify / Docker + Nginx |
| **Backend** | [`veyra-server/`](./veyra-server/) | Node.js 20, Express, TypeScript, Prisma, PostgreSQL | Render / Railway / Fly.io |

Each project has its own `package.json`, dependencies, Dockerfile, CI pipeline, and deploy target. There are no shared `node_modules` or npm workspaces.

## Live Deployments

- **Frontend (Vercel)**: [https://veyra-habit-tracker.vercel.app](https://veyra-habit-tracker.vercel.app)
- **Backend (Render)**: [https://veyra-habit-tracker.onrender.com](https://veyra-habit-tracker.onrender.com)

## Quick Start

### Prerequisites

- Node.js 20 LTS
- Docker & Docker Compose
- A Firebase project (Auth enabled)

### Full Stack (Docker)

```bash
# Start everything: Postgres + Server + Client
docker compose --profile full up -d

# Client: http://localhost:5173
# Server: http://localhost:3001
# Postgres: localhost:5432
```

### Individual Projects

```bash
# Backend
cd veyra-server
cp .env.example .env        # Edit with your values
npm install
npm run db:migrate           # Run Prisma migrations
npm run db:seed              # Seed demo data
npm run dev                  # http://localhost:3001

# Frontend (in a separate terminal)
cd veyra-client
cp .env.example .env        # Edit with your values
npm install
npm run dev                  # http://localhost:5173
```

## Documentation

| Document | Description |
|----------|-------------|
| [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md) | Feature roadmap and milestones |
| [Progress](./docs/PROGRESS.md) | Current development status |
| [Design System](./docs/DESIGN_SYSTEM.md) | Glass morphism tokens, colors, typography |
| [API Contract](./docs/API.md) | REST endpoints + Socket.IO events |
| [Architecture](./docs/ARCHITECTURE.md) | System design, data flow, layering rules |
| [Deployment](./docs/DEPLOYMENT.md) | Step-by-step deployment guide |

## Scripts (per project)

Both projects support these commands:

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm run lint        # ESLint
npm run typecheck   # TypeScript type checking
npm test            # Vitest
npm run format      # Prettier
```

## License

[MIT](./LICENSE)
