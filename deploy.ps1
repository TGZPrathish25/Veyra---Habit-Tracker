# Veyra One-Click Deployment Automation (PowerShell)
# Usage: .\deploy.ps1

Write-Host "🚀 Starting Veyra Production Deployment..." -ForegroundColor Cyan

# 1. Run Server Verification
Write-Host "📦 [1/4] Running veyra-server test suites..." -ForegroundColor Yellow
Push-Location veyra-server
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Server tests failed. Aborting deployment." -ForegroundColor Red
    Pop-Location
    exit 1
}
npm run build
Pop-Location

# 2. Run Client Verification & Build
Write-Host "🎨 [2/4] Running veyra-client tests and production bundle..." -ForegroundColor Yellow
Push-Location veyra-client
npm test -- --run
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Client tests failed. Aborting deployment." -ForegroundColor Red
    Pop-Location
    exit 1
}
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Client build failed. Aborting deployment." -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# 3. Deploy Firestore Rules & Indexes
Write-Host "🔒 [3/4] Deploying Cloud Firestore rules and indexes..." -ForegroundColor Yellow
npx firebase-tools deploy --only firestore:rules,firestore:indexes

# 4. Deploy Firebase Hosting
Write-Host "🌐 [4/4] Deploying client bundle to Firebase Hosting..." -ForegroundColor Yellow
npx firebase-tools deploy --only hosting

Write-Host ""
Write-Host "✨ Deployment Complete! Veyra is live at:" -ForegroundColor Green
Write-Host "👉 https://veyra-25p10s.web.app" -ForegroundColor Cyan
Write-Host "👉 https://veyra-25p10s.firebaseapp.com" -ForegroundColor Cyan
