#!/usr/bin/env bash
set -e

# Veyra One-Click Deployment Automation (Bash)
# Usage: ./deploy.sh

echo "🚀 Starting Veyra Production Deployment..."

# 1. Run Server Verification
echo "📦 [1/4] Running veyra-server test suites..."
(cd veyra-server && npm test && npm run build)

# 2. Run Client Verification & Build
echo "🎨 [2/4] Running veyra-client tests and production bundle..."
(cd veyra-client && npm test -- --run && npm run build)

# 3. Deploy Firestore Rules & Indexes
echo "🔒 [3/4] Deploying Cloud Firestore rules and indexes..."
npx firebase-tools deploy --only firestore:rules,firestore:indexes

# 4. Deploy Firebase Hosting
echo "🌐 [4/4] Deploying client bundle to Firebase Hosting..."
npx firebase-tools deploy --only hosting

echo ""
echo "✨ Deployment Complete! Veyra is live at:"
echo "👉 Frontend (Vercel): https://veyra-habit-tracker.vercel.app"
echo "👉 Backend (Render):  https://veyra-habit-tracker.onrender.com"
echo "👉 Firebase Mirror:   https://veyra-25p10s.web.app"

