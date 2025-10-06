# PHILGEPS Data Explorer - Environment Setup Script (Clean Version)
# This script creates the necessary .env files for both backend and frontend
# 
# Usage: .\setup_env_clean.ps1 [development|production]

param(
    [string]$Mode = "development"
)

# CONFIGURATION SECTION - Edit these values as needed
# ==================================================

# Production Domain Configuration
$PROD_FRONTEND_DOMAIN = "philgeps.simple-systems.dev"
$PROD_API_DOMAIN = "philgeps-api.simple-systems.dev"
$PROD_SECRET_KEY = "your-super-secret-key-change-this-in-production"
$PROD_DEBUG = "False"
$PROD_SSL_REDIRECT = "True"

# Development Domain Configuration
$DEV_FRONTEND_DOMAIN = "localhost:3000"
$DEV_API_DOMAIN = "localhost:3200"
$DEV_SECRET_KEY = "dev-secret-key-not-for-production"
$DEV_DEBUG = "True"
$DEV_SSL_REDIRECT = "False"

# API Source Selection - Choose one (1-3):
# 1 = Public API (use your hosted backend - no local backend needed)
# 2 = Local Development (use local backend - for development/testing)
# 3 = Custom URL (use any custom backend URL)
    $API_SOURCE_OPTION = 1

# API Source URLs - Configure these as needed:
$PUBLIC_API_URL = "https://philgeps-api.simple-systems.dev"  # API subdomain (preferred)
$LOCAL_API_URL = "http://localhost:3200"  # Local backend
$CUSTOM_API_URL = "https://philgeps-api.simple-systems.dev"  # API subdomain (preferred)

# Port Configuration
$BACKEND_PORT = "3200"  # Django backend port
$FRONTEND_PORT = "3000"  # React frontend port

# ==================================================
# END CONFIGURATION SECTION

# Help function
function Show-Help {
    Write-Host "PHILGEPS Data Explorer - Environment Setup Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\setup_env_clean.ps1 [MODE]"
    Write-Host ""
    Write-Host "Modes:"
    Write-Host "  development  - Create .env files for local development"
    Write-Host "  production   - Create .env files for production deployment"
    Write-Host "  help         - Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\setup_env_clean.ps1              # Development mode (default)"
    Write-Host "  .\setup_env_clean.ps1 development  # Development mode (explicit)"
    Write-Host "  .\setup_env_clean.ps1 production   # Production mode"
    Write-Host "  .\setup_env_clean.ps1 help         # Show this help"
    Write-Host ""
    Write-Host "This script will create:"
    Write-Host "  - backend/django/.env (Django configuration)"
    Write-Host "  - frontend/.env (React configuration)"
    Write-Host ""
    Write-Host "Make sure to edit the CONFIGURATION section at the top of this script"
    Write-Host "before running it for the first time!"
}

# Show help if requested
if ($Mode -eq "help") {
    Show-Help
    exit 0
}

# Validate mode
if ($Mode -notin @("development", "production")) {
    Write-Host "Error: Invalid mode '$Mode'. Use 'development', 'production', or 'help'." -ForegroundColor Red
    Show-Help
    exit 1
}

# Set up environment based on mode
if ($Mode -eq "production") {
    Write-Host "Setting up PRODUCTION environment files for PHILGEPS Data Explorer..." -ForegroundColor Cyan
    Write-Host "   Mode: Production" -ForegroundColor White
    Write-Host "   Target: Deployed application" -ForegroundColor White
    Write-Host ""
    
    $backendEnv = @"
# Django Settings - PRODUCTION
# These are the ONLY variables actually used by the web app

# REQUIRED: Django security key (MUST be changed for production)
SECRET_KEY=$($PROD_SECRET_KEY)

# REQUIRED: Debug mode (False for production)
DEBUG=$($PROD_DEBUG)

# REQUIRED: Allowed hosts for security (MUST be set to your API domain)
ALLOWED_HOSTS=$($PROD_API_DOMAIN),www.$($PROD_API_DOMAIN)

# REQUIRED: CORS origins for API access (MUST be set to your frontend URL)
CORS_ALLOWED_ORIGINS=https://$($PROD_FRONTEND_DOMAIN),https://www.$($PROD_FRONTEND_DOMAIN)

# REQUIRED: Force HTTPS in production
SECURE_SSL_REDIRECT=$($PROD_SSL_REDIRECT)
"@
} else {
    Write-Host "Setting up DEVELOPMENT environment files for PHILGEPS Data Explorer..." -ForegroundColor Cyan
    Write-Host "   Mode: Development" -ForegroundColor White
    Write-Host "   Target: Local development" -ForegroundColor White
    Write-Host ""
    
    $backendEnv = @"
# Django Settings - DEVELOPMENT
# These are the ONLY variables actually used by the web app

# REQUIRED: Django security key (safe for development)
SECRET_KEY=$($DEV_SECRET_KEY)

# REQUIRED: Debug mode (True for development)
DEBUG=$($DEV_DEBUG)

# REQUIRED: Allowed hosts for security (localhost for development)
ALLOWED_HOSTS=$($DEV_API_DOMAIN),localhost,127.0.0.1

# REQUIRED: CORS origins for API access (localhost for development)
CORS_ALLOWED_ORIGINS=http://$($DEV_FRONTEND_DOMAIN),http://localhost:3000,http://127.0.0.1:3000

# REQUIRED: Force HTTPS in production (False for development)
SECURE_SSL_REDIRECT=$($DEV_SSL_REDIRECT)

# NOTE: CORS_ALLOWED_ORIGINS uses localhost defaults + frontend domains for development
"@
}

# Ensure directory exists
$backendDir = "backend/django"
if (!(Test-Path $backendDir)) {
    New-Item -ItemType Directory -Path $backendDir -Force | Out-Null
}

$backendEnv | Set-Content -Path "$backendDir/.env" -Encoding UTF8
Write-Host "Backend .env file created successfully!" -ForegroundColor Green
Write-Host "   Path: backend/django/.env" -ForegroundColor White

if ($Mode -eq "production") {
    Write-Host "   Configuration: Production settings" -ForegroundColor White
    Write-Host "   API Domain: $PROD_API_DOMAIN" -ForegroundColor White
    Write-Host "   Frontend Domain: $PROD_FRONTEND_DOMAIN" -ForegroundColor White
} else {
    Write-Host "   Configuration: Development settings" -ForegroundColor White
    Write-Host "   API Domain: $DEV_API_DOMAIN" -ForegroundColor White
    Write-Host "   Frontend Domain: $DEV_FRONTEND_DOMAIN" -ForegroundColor White
}

# Determine API source
switch ($API_SOURCE_OPTION) {
    1 { $SELECTED_API_URL = $PUBLIC_API_URL; $SELECTED_MODE = "public" }
    2 { $SELECTED_API_URL = $LOCAL_API_URL; $SELECTED_MODE = "local" }
    3 { $SELECTED_API_URL = $CUSTOM_API_URL; $SELECTED_MODE = "custom" }
    default { 
        Write-Host "Warning: Invalid API_SOURCE_OPTION ($API_SOURCE_OPTION). Using public API." -ForegroundColor Yellow
        $SELECTED_API_URL = $PUBLIC_API_URL; $SELECTED_MODE = "public" 
    }
}

Write-Host ""
Write-Host "API Source Configuration:" -ForegroundColor Cyan
Write-Host "   Mode: $SELECTED_MODE" -ForegroundColor White
Write-Host "   URL: $SELECTED_API_URL" -ForegroundColor White
Write-Host ""

# Create frontend environment file
Write-Host "Creating frontend environment file..." -ForegroundColor Cyan
Write-Host "   Location: frontend/.env" -ForegroundColor White
Write-Host "   Purpose: React application configuration" -ForegroundColor White

$frontendEnv = @"
# Frontend Environment Variables - $($Mode.ToUpper())
# These are the ONLY variables actually used by the web app

# REQUIRED: Backend API URL for proxy (MUST be set to your backend URL)
VITE_API_URL=$SELECTED_API_URL

# OPTIONAL: Alternative API sources (uncomment to use)
# VITE_PUBLIC_API_URL=https://philgeps-api.simple-systems.dev
# VITE_LOCAL_API_URL=http://localhost:3200
# VITE_CUSTOM_API_URL=https://philgeps-api.simple-systems.dev

# NOTE: VITE_HOST and VITE_PORT use defaults (0.0.0.0:3000)
# NOTE: Other VITE_ variables are not used by the web app
"@

# Ensure frontend directory exists
$frontendDir = "frontend"
if (!(Test-Path $frontendDir)) {
    New-Item -ItemType Directory -Path $frontendDir -Force | Out-Null
}

$frontendEnv | Set-Content -Path "$frontendDir/.env" -Encoding UTF8
Write-Host "Frontend .env file created successfully!" -ForegroundColor Green
Write-Host "   Path: frontend/.env" -ForegroundColor White
Write-Host "   Configuration: $SELECTED_MODE mode" -ForegroundColor White
Write-Host "   API URL: $SELECTED_API_URL" -ForegroundColor White

Write-Host ""
Write-Host "Environment files created successfully!" -ForegroundColor Cyan
Write-Host "   Backend: backend/django/.env" -ForegroundColor White
Write-Host "   Frontend: frontend/.env" -ForegroundColor White

Write-Host ""

if ($Mode -eq "production") {
    Write-Host "Production setup complete! Next steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Edit the CONFIGURATION section at the top of this script:" -ForegroundColor White
    Write-Host "   - Update PROD_FRONTEND_DOMAIN with your frontend domain" -ForegroundColor White
    Write-Host "   - Update PROD_API_DOMAIN with your API domain" -ForegroundColor White
    Write-Host "   - Update PROD_SECRET_KEY with a secure value" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Re-run this script: .\setup_env_clean.ps1 production" -ForegroundColor White
    Write-Host "3. Deploy your application" -ForegroundColor White
    Write-Host "4. Test the production setup" -ForegroundColor White
    Write-Host ""
    Write-Host "Pro tip: Edit the CONFIGURATION section at the top of this script!" -ForegroundColor Yellow
} else {
    Write-Host "Development setup complete! Next steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Run the backend (if using local API):" -ForegroundColor White
    Write-Host "    cd backend/django && python manage.py runserver 0.0.0.0:$BACKEND_PORT" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Run the frontend:" -ForegroundColor White
    Write-Host "    cd frontend && npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Access your application:" -ForegroundColor White
    Write-Host "    Frontend: http://localhost:$FRONTEND_PORT" -ForegroundColor White
    Write-Host "    API: $SELECTED_API_URL" -ForegroundColor White
    Write-Host ""
    Write-Host "Current API source: $SELECTED_MODE mode" -ForegroundColor White
    Write-Host "   To change, edit API_SOURCE_OPTION in the CONFIGURATION section and re-run this script!" -ForegroundColor White
}

Write-Host ""
Write-Host "Security reminder: Never commit .env files to Git!" -ForegroundColor Yellow
Write-Host "   They are already included in .gitignore" -ForegroundColor Green
Write-Host ""
Write-Host "Setup complete! Your PHILGEPS Data Explorer is ready to go!" -ForegroundColor Green
