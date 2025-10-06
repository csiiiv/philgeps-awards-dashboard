# Simple Environment Setup Script (No Emojis)
# This version works in all PowerShell environments

param(
    [string]$API_SOURCE_OPTION = "public"
)

Write-Host "Setting up environment variables..." -ForegroundColor Green

# Configuration
$PROD_API_DOMAIN = "philgeps-api.simple-systems.dev"
$PROD_FRONTEND_DOMAIN = "philgeps.simple-systems.dev"

# Choose API source
if ($API_SOURCE_OPTION -eq "local") {
    $API_URL = "http://localhost:3200"
    Write-Host "Using LOCAL API: $API_URL" -ForegroundColor Yellow
} else {
    $API_URL = "https://$PROD_API_DOMAIN"
    Write-Host "Using PUBLIC API: $API_URL" -ForegroundColor Yellow
}

# Backend Environment
$backendEnv = @"
# Django Settings
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS="$PROD_API_DOMAIN,www.$PROD_API_DOMAIN,localhost,127.0.0.1"
CORS_ALLOWED_ORIGINS="https://$PROD_FRONTEND_DOMAIN,https://www.$PROD_FRONTEND_DOMAIN,http://localhost:3000,http://127.0.0.1:3000"

# Database
DATABASE_URL=sqlite:///db.sqlite3

# Static Files
STATIC_URL=/static/
STATIC_ROOT=staticfiles/

# API Configuration
API_BASE_URL=$API_URL
"@

# Frontend Environment
$frontendEnv = @"
# Frontend Environment Variables

# Development Server
VITE_HOST=0.0.0.0
VITE_PORT=3000

# API Configuration
VITE_API_URL=$API_URL

# Optional: Custom base URL for production
# VITE_BASE_URL=https://yourdomain.com

# Optional: Feature flags
# VITE_ENABLE_ANALYTICS=true
# VITE_ENABLE_DEBUG_MODE=false
"@

# Write environment files
Write-Host "Writing backend/.env..." -ForegroundColor Cyan
$backendEnv | Out-File -FilePath "backend/.env" -Encoding UTF8

Write-Host "Writing frontend/.env..." -ForegroundColor Cyan
$frontendEnv | Out-File -FilePath "frontend/.env" -Encoding UTF8

Write-Host "Environment setup complete!" -ForegroundColor Green
Write-Host "Backend API: $API_URL" -ForegroundColor Yellow
Write-Host "Frontend will use: $API_URL" -ForegroundColor Yellow

Write-Host "`nTo rebuild and restart servers, run:" -ForegroundColor Magenta
Write-Host ".\run_local.ps1 -Force" -ForegroundColor White