#!/bin/bash

# PHILGEPS Data Explorer - Environment Setup Script
# This script creates the necessary .env files for development or production

# =============================================================================
# CONFIGURATION - Edit these values as needed
# =============================================================================

# Development Settings
DEV_SECRET_KEY="django-insecure-dev-key-change-in-production"
DEV_DEBUG="True"
DEV_FRONTEND_DOMAIN="https://philgeps.simple-systems.dev"
DEV_API_DOMAIN="philgeps-api.simple-systems.dev"

# Production Settings
PROD_SECRET_KEY="CHANGE-THIS-TO-A-SECURE-SECRET-KEY-IN-PRODUCTION"
PROD_DEBUG="False"
PROD_FRONTEND_DOMAIN="philgeps.simple-systems.dev"
PROD_API_DOMAIN="philgeps-api.simple-systems.dev"
PROD_SSL_REDIRECT="True"

# API Source Selection - Choose one (1-3):
# 1 = Public API (use your hosted backend - no local backend needed)
# 2 = Local Development (use local backend - for development/testing)
# 3 = Custom URL (use any custom backend URL)
API_SOURCE_OPTION=1

# API Source URLs - Configure these as needed:
PUBLIC_API_URL="https://philgeps-api.simple-systems.dev"  # API subdomain (preferred)
LOCAL_API_URL="http://localhost:$BACKEND_PORT"  # Local backend
CUSTOM_API_URL="https://philgeps-api.simple-systems.dev"  # API subdomain (preferred)

# Port Configuration - Configure these as needed:
BACKEND_PORT="3200"  # Django backend port
FRONTEND_PORT="3000"  # React frontend port

# =============================================================================
# SCRIPT LOGIC - Don't edit below this line
# =============================================================================

# Help function
show_help() {
    echo "🚀 PHILGEPS Data Explorer - Environment Setup Script"
    echo ""
    echo "USAGE:"
    echo "  ./setup_env.sh [MODE]"
    echo ""
    echo "MODES:"
    echo "  development    Set up development environment (default)"
    echo "  production     Set up production environment"
    echo "  help, -h, --help  Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  ./setup_env.sh              # Development mode (default)"
    echo "  ./setup_env.sh development  # Development mode (explicit)"
    echo "  ./setup_env.sh production   # Production mode"
    echo "  ./setup_env.sh help         # Show this help"
    echo ""
    echo "WHAT IT DOES:"
    echo "  • Creates backend/django/.env with Django configuration"
    echo "  • Creates frontend/.env with React configuration"
    echo "  • Configures API sources, domains, and security settings"
    echo ""
    echo "CONFIGURATION:"
    echo "  Edit the CONFIGURATION section at the top of this script to customize:"
    echo "  • Domain names (frontend and API)"
    echo "  • API source selection (public/local/custom)"
    echo "  • Port numbers (backend and frontend)"
    echo "  • Security keys and settings"
    echo ""
    echo "For more information, see the comments in the script."
    exit 0
}

# Check for help arguments
if [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
fi

# Check if production mode is requested
if [ "$1" = "production" ]; then
    echo "🚀 Setting up PRODUCTION environment files for PHILGEPS Data Explorer..."
    echo "   Mode: Production"
    echo "   Target: Deployed application"
    MODE="production"
elif [ "$1" = "development" ] || [ -z "$1" ]; then
    echo "🚀 Setting up DEVELOPMENT environment files for PHILGEPS Data Explorer..."
    echo "   Mode: Development"
    echo "   Target: Local development"
    MODE="development"
else
    echo "❌ Error: Invalid argument '$1'"
    echo ""
    echo "Valid arguments:"
    echo "  development    Set up development environment (default)"
    echo "  production     Set up production environment"
    echo "  help, -h, --help  Show help message"
    echo ""
    echo "Run './setup_env.sh help' for more information."
    exit 1
fi

# Create backend .env file
echo ""
echo "📁 Creating backend environment file..."
echo "   Location: backend/django/.env"
echo "   Purpose: Django server configuration"
if [ "$MODE" = "production" ]; then
    cat > backend/django/.env << EOF
# Django Settings - PRODUCTION
# These are the ONLY variables actually used by the web app

# REQUIRED: Django security key (MUST be changed for production)
SECRET_KEY=$PROD_SECRET_KEY

# REQUIRED: Debug mode (False for production)
DEBUG=$PROD_DEBUG

# REQUIRED: Allowed hosts for security (MUST be set to your API domain)
ALLOWED_HOSTS=$PROD_API_DOMAIN,www.$PROD_API_DOMAIN

# REQUIRED: CORS origins for API access (MUST be set to your frontend URL)
CORS_ALLOWED_ORIGINS=https://$PROD_FRONTEND_DOMAIN,https://www.$PROD_FRONTEND_DOMAIN

# REQUIRED: Force HTTPS in production
SECURE_SSL_REDIRECT=$PROD_SSL_REDIRECT
EOF
else
    cat > backend/django/.env << EOF
# Django Settings - DEVELOPMENT
# These are the ONLY variables actually used by the web app

# REQUIRED: Django security key (safe for development)
SECRET_KEY=$DEV_SECRET_KEY

# REQUIRED: Debug mode (True for development)
DEBUG=$DEV_DEBUG

# REQUIRED: Frontend domains for CORS (where requests come from)
FRONTEND_DOMAINS=$DEV_FRONTEND_DOMAIN

# REQUIRED: API domains for ALLOWED_HOSTS (where the API is served from)
API_DOMAINS=$DEV_API_DOMAIN

# NOTE: ALLOWED_HOSTS uses localhost defaults + API domains for development
# NOTE: CORS_ALLOWED_ORIGINS uses localhost defaults + frontend domains for development
EOF
fi
echo "✅ Backend .env file created successfully!"
echo "   📍 Path: backend/django/.env"
if [ "$MODE" = "production" ]; then
    echo "   🔧 Configuration: Production settings"
    echo "   🌐 API Domain: $PROD_API_DOMAIN"
    echo "   🎯 Frontend Domain: $PROD_FRONTEND_DOMAIN"
else
    echo "   🔧 Configuration: Development settings"
    echo "   🌐 API Domain: $DEV_API_DOMAIN"
    echo "   🎯 Frontend Domain: $DEV_FRONTEND_DOMAIN"
fi

# Determine API source based on configuration
case $API_SOURCE_OPTION in
    1) SELECTED_API_URL="$PUBLIC_API_URL"; SELECTED_MODE="public" ;;
    2) SELECTED_API_URL="$LOCAL_API_URL"; SELECTED_MODE="local" ;;
    3) SELECTED_API_URL="$CUSTOM_API_URL"; SELECTED_MODE="custom" ;;
    *) echo "Invalid API_SOURCE_OPTION: $API_SOURCE_OPTION. Using public API."; SELECTED_API_URL="$PUBLIC_API_URL"; SELECTED_MODE="public" ;;
esac

echo ""
echo "🔧 API Source Configuration:"
echo "   Mode: $SELECTED_MODE"
echo "   URL: $SELECTED_API_URL"

# Create frontend .env file
echo ""
echo "📁 Creating frontend environment file..."
echo "   Location: frontend/.env"
echo "   Purpose: React application configuration"
if [ "$MODE" = "production" ]; then
    cat > frontend/.env << EOF
# Frontend Environment Variables - PRODUCTION
# These are the ONLY variables actually used by the web app

# REQUIRED: Backend API URL for proxy (MUST be set to your backend URL)
VITE_API_URL=https://$PROD_API_DOMAIN

# OPTIONAL: Alternative API sources (uncomment to use)
# VITE_PUBLIC_API_URL=$PUBLIC_API_URL
# VITE_LOCAL_API_URL=$LOCAL_API_URL
# VITE_CUSTOM_API_URL=$CUSTOM_API_URL

# NOTE: VITE_HOST and VITE_PORT use defaults (0.0.0.0:3000)
# NOTE: Other VITE_ variables are not used by the web app
EOF
else
    cat > frontend/.env << EOF
# Frontend Environment Variables - $SELECTED_MODE
# Uses your selected API source

# REQUIRED: Selected API URL
VITE_API_URL=$SELECTED_API_URL

# OPTIONAL: Alternative API sources (uncomment to use)
# VITE_PUBLIC_API_URL=$PUBLIC_API_URL
# VITE_LOCAL_API_URL=$LOCAL_API_URL
# VITE_CUSTOM_API_URL=$CUSTOM_API_URL

# NOTE: VITE_HOST and VITE_PORT use defaults (0.0.0.0:3000)
# NOTE: Other VITE_ variables are not used by the web app
EOF
fi
echo "✅ Frontend .env file created successfully!"
echo "   📍 Path: frontend/.env"
echo "   🔧 Configuration: $SELECTED_MODE mode"
echo "   🌐 API URL: $SELECTED_API_URL"

echo ""
echo "🎉 Environment files created successfully!"
echo "   📁 Backend: backend/django/.env"
echo "   📁 Frontend: frontend/.env"
echo ""
if [ "$MODE" = "production" ]; then
    echo "📋 Production setup complete! Next steps:"
    echo ""
    echo "1️⃣  Edit the CONFIGURATION section at the top of this script:"
    echo "    • Update PROD_FRONTEND_DOMAIN with your frontend domain"
    echo "    • Update PROD_API_DOMAIN with your API domain"
    echo "    • Update PROD_SECRET_KEY with a secure value"
    echo ""
    echo "2️⃣  Re-run this script: ./setup_env.sh production"
    echo "3️⃣  Deploy your application"
    echo "4️⃣  Test the production setup"
    echo ""
    echo "💡 Pro tip: Edit the CONFIGURATION section at the top of this script!"
else
    echo "📋 Development setup complete! Next steps:"
    echo ""
    echo "1️⃣  Run the backend (if using local API):"
    echo "    cd backend/django && python manage.py runserver 0.0.0.0:$BACKEND_PORT"
    echo ""
    echo "2️⃣  Run the frontend:"
    echo "    cd frontend && npm run dev"
    echo ""
    echo "3️⃣  Access your application:"
    echo "    Frontend: http://localhost:$FRONTEND_PORT"
    echo "    API: $SELECTED_API_URL"
    echo ""
    echo "🔧 Current API source: $SELECTED_MODE mode"
    echo "   To change, edit API_SOURCE_OPTION in the CONFIGURATION section and re-run this script!"
fi
echo ""
echo "⚠️  Security reminder: Never commit .env files to Git!"
echo "   ✅ They are already included in .gitignore"
echo ""
echo "🎉 Setup complete! Your PHILGEPS Data Explorer is ready to go!"
