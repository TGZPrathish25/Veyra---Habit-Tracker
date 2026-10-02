# veyra-client

> Frontend for Veyra — React 18, Vite, TypeScript, Tailwind CSS, Glassmorphism UI

## Prerequisites

- Node.js 20 LTS

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start dev server
npm run dev
# App runs at http://localhost:5173
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run tests with Vitest |
| `npm run format` | Format code with Prettier |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend REST API URL |
| `VITE_SOCKET_URL` | Yes | Backend Socket.IO URL |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | No | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | No | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID |

## Folder Structure

```
src/
├── main.tsx                    # Entry point
├── app/                        # App shell, providers, router, guards
├── config/                     # Env validation, Firebase, query client, routes
├── lib/                        # API client, socket, date utils, helpers
├── features/                   # Domain features (self-contained modules)
│   ├── auth/                   # Authentication
│   ├── dashboard/              # Dashboard panels
│   ├── daily-tasks/            # Daily task management
│   ├── weekly-tasks/           # Weekly planner
│   ├── monthly-goals/          # Monthly goals
│   ├── deadlines/              # Deadline alerts
│   ├── gamification/           # XP, levels, achievements
│   ├── analytics/              # Charts and stats
│   ├── history/                # History browser
│   ├── friends/                # Social features
│   ├── challenges/             # Challenges
│   ├── leaderboard/            # Leaderboard
│   ├── notifications/          # Notifications
│   ├── profile/                # User profile
│   └── settings/               # Settings tabs
├── pages/                      # Thin route-level components
├── components/                 # Shared UI components
│   ├── glass/                  # Glassmorphism components
│   ├── ui/                     # UI primitives
│   ├── layout/                 # App shell, sidebar, nav
│   └── charts/                 # Chart wrappers
├── hooks/                      # Shared hooks
├── store/                      # Zustand stores (UI state only)
├── styles/                     # CSS tokens, glass recipes, globals
├── types/                      # Shared type definitions
├── utils/                      # Utility functions
└── test/                       # Test setup and helpers
```

## Architecture

```
pages → features → components/lib/hooks/utils
```

- Pages are thin route-level components that compose features
- Features export a public API via `index.ts`; no cross-feature internal imports
- Server state lives in TanStack Query; Zustand is for UI state only
- All env access goes through `config/env.ts`

## Responsive Design

- **Mobile-first** with Tailwind responsive classes
- **Mobile:** Bottom tab nav, single column, full-screen modals
- **Tablet:** Collapsible sidebar, 2-column grids
- **Desktop:** Persistent sidebar, multi-column dashboard
- **Touch targets:** Minimum 44x44px on all interactive elements
- **Fluid typography:** `clamp()`-based type scale

See [Design System docs](../docs/DESIGN_SYSTEM.md) for details.
