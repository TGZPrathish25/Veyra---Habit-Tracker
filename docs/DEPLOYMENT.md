# Deployment Guide

> Step-by-step instructions for deploying Veyra to production.

## Prerequisites

- A Firebase project with Authentication enabled
- A PostgreSQL database (Neon, Supabase, Railway, or Render managed)
- A static hosting account (Vercel, Netlify, or Cloudflare Pages)
- A server hosting account (Render, Railway, or Fly.io)

## Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → Sign-in methods (Email/Password, Google, etc.)
4. Get **Web SDK config** (for the client): Project Settings → General → Web app
5. Get **Service Account key** (for the server): Project Settings → Service accounts → Generate new private key
6. Base64-encode the service account JSON: `base64 -i service-account.json`
7. Add your production domains to **Authorized domains** in Authentication settings

## Step 2: PostgreSQL Database

### Option A: Neon (Recommended)
1. Create account at [neon.tech](https://neon.tech)
2. Create a new project and database
3. Copy the connection string: `postgresql://user:pass@host/db?sslmode=require`

### Option B: Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string (URI)

### Option C: Railway / Render
1. Add a PostgreSQL service to your project
2. Copy the `DATABASE_URL` from the service dashboard

## Step 3: Deploy Backend (`veyra-server`)

### Environment Variables

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | `postgresql://...` | PostgreSQL connection string |
| `FIREBASE_SERVICE_ACCOUNT` | ✅ | `eyJ0eX...` (base64) | Firebase service account JSON (base64-encoded) |
| `CLIENT_ORIGIN` | ✅ | `https://veyra.app` | Frontend URL for CORS |
| `PORT` | ❌ | `3001` | Server port (default: 3001) |
| `NODE_ENV` | ❌ | `production` | Environment (default: development) |
| `LOG_LEVEL` | ❌ | `info` | Pino log level (default: info) |
| `GEMINI_API_KEY` | ❌ | `AIza...` | Optional: Gemini API key for AI reviews |

### Option A: Render
1. Connect your GitHub repo
2. Set root directory to `veyra-server`
3. Build command: `npm ci && npm run build && npx prisma migrate deploy`
4. Start command: `npm start`
5. Add all environment variables

### Option B: Railway
1. Connect GitHub repo
2. Set root directory to `veyra-server`
3. Railway auto-detects Dockerfile
4. Add environment variables in the dashboard

### Option C: Fly.io
```bash
cd veyra-server
fly launch          # Creates fly.toml
fly secrets set DATABASE_URL="..." FIREBASE_SERVICE_ACCOUNT="..." CLIENT_ORIGIN="..."
fly deploy
```

### Run Migrations
Migrations run automatically via `prisma migrate deploy` in the Dockerfile or build command.

## Step 4: Deploy Frontend (`veyra-client`)

### Environment Variables

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ | `https://api.veyra.app` | Backend REST API URL |
| `VITE_SOCKET_URL` | ✅ | `https://api.veyra.app` | Backend Socket.IO URL |
| `VITE_FIREBASE_API_KEY` | ✅ | `AIza...` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | `veyra.firebaseapp.com` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | `veyra-prod` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ❌ | `veyra.appspot.com` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ❌ | `123456789` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | ✅ | `1:123:web:abc` | Firebase app ID |

### Option A: Vercel (Recommended)
1. Import GitHub repo
2. Set root directory to `veyra-client`
3. Framework preset: Vite
4. Add environment variables
5. Deploy

### Option B: Netlify
1. Connect GitHub repo
2. Set base directory to `veyra-client`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. The `public/_redirects` file handles SPA routing

### Option C: Docker
```bash
cd veyra-client
docker build -t veyra-client .
docker run -p 80:80 veyra-client
```

## Step 5: Post-Deploy Verification

1. Visit your client URL — landing page should load
2. Check `{API_URL}/health` returns `{ "status": "ok" }`
3. Check `{API_URL}/ready` returns `{ "status": "ready" }`
4. Test login flow (Firebase Auth)
5. Verify CORS — client can call the API without errors

## Scaling Socket.IO

By default, Socket.IO runs in single-instance mode. To scale to multiple server instances:

1. Install the Redis adapter: `npm install @socket.io/redis-adapter redis`
2. Configure in `src/sockets/index.ts` (marked with `// EXTENSION POINT: Redis adapter`)
3. Enable sticky sessions on your load balancer
4. See [Socket.IO docs](https://socket.io/docs/v4/using-multiple-nodes/) for details
