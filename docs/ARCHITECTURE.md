# Architecture

> System architecture and design decisions for Veyra.

## System Overview

```
┌─────────────────┐     HTTPS/WSS      ┌─────────────────┐      SQL       ┌──────────────┐
│   veyra-client  │ ◄─────────────────► │   veyra-server  │ ◄────────────► │  PostgreSQL   │
│   (React SPA)   │                     │   (Express API) │               │  (Prisma ORM) │
└────────┬────────┘                     └────────┬────────┘               └──────────────┘
         │                                       │
         │  Firebase Auth                        │  Firebase Admin SDK
         ▼                                       ▼
    ┌──────────┐                           ┌──────────┐
    │ Firebase │ ◄─── Token Verification ──│ Firebase │
    │ Auth SDK │                           │ Admin    │
    └──────────┘                           └──────────┘
```

## Frontend Architecture (Feature-Based)

```
pages → features → components/lib/hooks/utils
```

- **Pages** are thin route-level components that compose features
- **Features** are self-contained domain modules with their own API, components, hooks, and types
- **Components** are shared, feature-agnostic UI primitives
- **Lib** contains utilities and service clients
- Features export a public API via `index.ts`; cross-feature imports use this barrel only

### State Management
- **Server state:** TanStack Query (inside each feature's `api/` and `hooks/`)
- **UI state:** Zustand (theme, sidebar, modals)
- **Form state:** React Hook Form + Zod validation

## Backend Architecture (Modular Layered)

```
routes → controller → service → repository → Prisma
```

- **Routes** define Express router with middleware (auth, validation)
- **Controllers** parse requests and format responses (no business logic)
- **Services** contain all business logic, cross-module coordination
- **Repositories** are the only layer that touches Prisma/DB
- Cross-module calls go through services, never repositories

### Key Patterns
- `app.ts` exports the Express app without calling `listen()`
- `server.ts` creates HTTP server, attaches Socket.IO, starts cron jobs
- Graceful shutdown: SIGTERM → stop accepting → close sockets → stop cron → disconnect Prisma
- Jobs use Postgres advisory locks for single-instance execution
- All routes validate with Zod; ownership enforced via `req.user.id`

## Data Flow: Task Completion

```
1. User toggles task → POST /api/v1/tasks/:id/toggle
2. authenticate middleware → verifies Firebase token
3. validate middleware → Zod validates body
4. Controller → calls TaskService.toggleOccurrence()
5. Service → validates ownership, updates DB, calculates XP
6. Repository → Prisma update
7. Service → emits Socket.IO events (xp:gained, streak:updated)
8. Controller → returns updated occurrence
9. Client → TanStack Query invalidates, UI updates
10. Socket → other tabs/devices receive real-time update
```

## Security

- Firebase ID token verification on every authenticated request
- CORS restricted to `CLIENT_ORIGIN`
- Rate limiting via `express-rate-limit`
- Helmet security headers
- Input validation with Zod on all endpoints
- Ownership enforcement (never trust client-supplied user IDs)
- Privacy filtering in services for friend/challenge visibility
