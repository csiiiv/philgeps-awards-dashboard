<#
.SYNOPSIS
    Local Server Runner for Production 1: Unified Parquet Architecture (Windows)
.DESCRIPTION
    Supports separate frontend and backend services for Cloudflare tunnel architecture
    Usage: .\run_local.ps1 [start|start-frontend|start-backend|stop|restart|status|logs|help] [options]
    Version: 3.0.0-windows
#>

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "start-frontend", "start-backend", "stop", "restart", "status", "logs", "config", "help")]
    [string]$Command = "start",
    
    [switch]$SkipBuild,
    [switch]$SkipMigrate,
    [switch]$RunOnly,
    [switch]$Force,
    [switch]$ForceNpmInstall,
    [switch]$DebugOutput
)

# =============================================================================
# SCRIPT CONFIGURATION
# =============================================================================

$ErrorActionPreference = "Stop"

# Set script and project directory
$SCRIPT_DIR = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent -Path $MyInvocation.MyCommand.Definition }
$PROD_DIR = $SCRIPT_DIR

# Load configuration from setup_env.ps1 or use defaults
function Load-Config {
    $configFile = Join-Path $SCRIPT_DIR "setup_env.ps1"
    if (Test-Path $configFile) {
        # Extract configuration values from setup_env.ps1
        $content = Get-Content $configFile -Raw
        $BACKEND_PORT = if ($content -match '\$BACKEND_PORT = "(\d+)"') { $Matches[1] } else { "3200" }
        $FRONTEND_PORT = if ($content -match '\$FRONTEND_PORT = "(\d+)"') { $Matches[1] } else { "3000" }
        $DEV_API_DOMAIN = if ($content -match '\$DEV_API_DOMAIN = "([^"]+)"') { $Matches[1] } else { "philgeps-api.simple-systems.dev" }
        $DEV_FRONTEND_DOMAIN = if ($content -match '\$DEV_FRONTEND_DOMAIN = "([^"]+)"') { $Matches[1] } else { "philgeps.simple-systems.dev" }
    } else {
        # Fallback to defaults
        $BACKEND_PORT = "3200"
        $FRONTEND_PORT = "3000"
        $DEV_API_DOMAIN = "philgeps-api.simple-systems.dev"
        $DEV_FRONTEND_DOMAIN = "philgeps.simple-systems.dev"
    }
    
    return @{
        BACKEND_PORT = [int]$BACKEND_PORT
        FRONTEND_PORT = [int]$FRONTEND_PORT
        DEV_API_DOMAIN = $DEV_API_DOMAIN
        DEV_FRONTEND_DOMAIN = $DEV_FRONTEND_DOMAIN
    }
}

# Load configuration
$Config = Load-Config
$BACKEND_PORT = $Config.BACKEND_PORT
$FRONTEND_PORT = $Config.FRONTEND_PORT
$DEV_API_DOMAIN = $Config.DEV_API_DOMAIN
$DEV_FRONTEND_DOMAIN = $Config.DEV_FRONTEND_DOMAIN

# Set up paths
$LOGS_DIR = Join-Path $SCRIPT_DIR "logs"
$BACKEND_PID_FILE = Join-Path $LOGS_DIR "backend.pid"
$FRONTEND_PID_FILE = Join-Path $LOGS_DIR "frontend.pid"
$BACKEND_LOG = Join-Path $LOGS_DIR "backend.log"
$FRONTEND_LOG = Join-Path $LOGS_DIR "frontend.log"
$LOG_FILE = Join-Path $LOGS_DIR "prod1_local_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Use a dedicated Windows venv directory by default to avoid Linux collisions
$VENV_DIR_DEFAULT = Join-Path $PROD_DIR "venv-windows"
$VENV_DIR = $env:VENV_DIR
if (-not $VENV_DIR) {
    $venvCandidate = Join-Path $PROD_DIR "venv"
    if (Test-Path (Join-Path $venvCandidate "Scripts\python.exe")) {
        $VENV_DIR = $venvCandidate
    } else {
        $VENV_DIR = $VENV_DIR_DEFAULT
    }
}

# Ensure logs directory exists
if (!(Test-Path $LOGS_DIR)) {
    New-Item -ItemType Directory -Path $LOGS_DIR -Force | Out-Null
}

# =============================================================================
# LOGGING HELPERS
# =============================================================================

$DEBUG_MODE = $DebugOutput

function Get-Timestamp { Get-Date -Format "yyyy-MM-dd HH:mm:ss" }

function Write-Log {
    param(
        [string]$Level,
        [string]$Message
    )
    $timestamp = Get-Timestamp
    $logMessage = "[$timestamp] $Level`: $Message"
    Write-Host $logMessage
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Write-LogInfo { param([string]$Message) Write-Log "INFO" $Message }
function Write-LogWarn { param([string]$Message) Write-Log "WARN" $Message }
function Write-LogError { param([string]$Message) Write-Log "ERROR" $Message }
function Write-LogSuccess { param([string]$Message) Write-Log "SUCCESS" $Message }
function Write-LogDebug { 
    param([string]$Message) 
    if ($DEBUG_MODE) { Write-Log "DEBUG" $Message }
}

# =============================================================================
# HELP FUNCTION
# =============================================================================

function Show-Help {
    $helpText = @"
Local Server Runner for Production 1: Unified Parquet Architecture (Windows) - v3.0.0

Usage: .\run_local.ps1 [COMMAND] [OPTIONS]

Commands:
  start            Setup venv, migrate, and start both services (default)
  start-frontend   Start only the React development server (port $FRONTEND_PORT)
  start-backend    Start only the Django backend server (port $BACKEND_PORT)
  stop             Stop all running services
  restart          Stop, then start all services
  status           Show service status and health
  logs             Tail the service logs
  config           Show loaded configuration from setup_env.ps1
  help             Show this help

Options:
  -SkipBuild       Skip frontend build
  -SkipMigrate     Skip Django migrations
  -RunOnly         Shortcut for -SkipBuild and -SkipMigrate
  -Force           Kill any process using ports before start
  -ForceNpmInstall Force npm install even if node_modules exists
  -DebugOutput     Enable verbose debug output

Architecture:
  Frontend: http://localhost:$FRONTEND_PORT (Vite dev server)
  Backend:  http://localhost:$BACKEND_PORT (Django + serves built frontend)
  
  Cloudflare Tunnels:
  - https://$DEV_FRONTEND_DOMAIN/ → localhost:$FRONTEND_PORT
  - https://$DEV_API_DOMAIN/ → localhost:$BACKEND_PORT

Env:
  VENV_DIR         Path to Python virtualenv to use (default: $VENV_DIR_DEFAULT)
"@
    Write-Host $helpText -ForegroundColor Yellow
}

# =============================================================================
# ENVIRONMENT AND PATH CHECKS
# =============================================================================

function Test-CommandExists {
    param([string]$Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

function Test-Environment {
    Write-LogInfo "Checking environment setup..."
    $backendPath = Join-Path $PROD_DIR "backend"
    $frontendPath = Join-Path $PROD_DIR "frontend"

    Write-LogDebug "Script directory: $SCRIPT_DIR"
    Write-LogDebug "Project directory: $PROD_DIR"
    Write-LogDebug "Current working directory: $(Get-Location)"
    Write-LogDebug "Backend path: $backendPath (exists: $(Test-Path $backendPath))"
    Write-LogDebug "Frontend path: $frontendPath (exists: $(Test-Path $frontendPath))"

    if (!(Test-Path $backendPath) -or !(Test-Path $frontendPath)) {
        Write-LogError "Project structure is incorrect. Expected 'backend' and 'frontend' in '$PROD_DIR'."
        exit 1
    }

    $commands = @("python", "pip", "node", "npm")
    foreach ($cmd in $commands) {
        if (!(Test-CommandExists $cmd)) {
            Write-LogError "'$cmd' not found in PATH"
            exit 1
        }
    }

    Write-LogSuccess "Environment check passed."
}

# =============================================================================
# CORE FUNCTIONS
# =============================================================================

function Build-Frontend {
    if ($SkipBuild) {
        Write-LogInfo "Skipping frontend build as requested."
        return
    }
    
    Write-LogInfo "Building React frontend..."
    Push-Location (Join-Path $PROD_DIR "frontend")
    
    try {
        if (!(Test-Path "node_modules") -or $ForceNpmInstall) {
            if ($ForceNpmInstall) {
                Write-LogInfo "-ForceNpmInstall specified: running 'npm install' regardless of node_modules presence..."
            } else {
                Write-LogInfo "Installing frontend dependencies with 'npm install'..."
            }
            npm install
        } else {
            Write-LogInfo "Frontend dependencies already installed."
        }
        
        Write-LogInfo "Building frontend with 'npm run build'..."
        npm run build
        
        if (!(Test-Path "dist\index.html")) {
            Write-LogError "Frontend build failed: 'dist\index.html' not found after build."
            exit 1
        }
        
        Write-LogSuccess "Frontend build completed successfully."
    } finally {
        Pop-Location
    }
}

function Setup-PythonEnvironment {
    Write-LogInfo "Setting up Python environment..."
    $backendDir = Join-Path $PROD_DIR "backend\django"
    $venvDir = $VENV_DIR

    Write-LogDebug "Backend directory: $backendDir (exists: $(Test-Path $backendDir))"
    Write-LogDebug "Virtual environment directory: $venvDir (exists: $(Test-Path $venvDir))"

    Push-Location $backendDir

    try {
        if (!(Test-Path $venvDir)) {
            Write-LogInfo "Creating Python virtual environment at '$venvDir'..."
            python -m venv $venvDir
        }

        $pythonVenv = Join-Path $venvDir "Scripts\python.exe"
        $pipVenv = Join-Path $venvDir "Scripts\pip.exe"

        if (!(Test-Path $pythonVenv) -or !(Test-Path $pipVenv)) {
            Write-LogError "Virtual environment is corrupted or was not created successfully."
            Write-LogError "Missing executables at '$pythonVenv' or '$pipVenv'."
            exit 1
        }

        if (Test-Path "requirements.txt") {
            Write-LogInfo "Installing Python dependencies from requirements.txt..."
            & $pipVenv install -r requirements.txt
        } else {
            Write-LogWarn "'requirements.txt' not found. Installing essential dependencies..."
            & $pipVenv install django djangorestframework django-cors-headers django-filter whitenoise gunicorn duckdb pandas
        }

        Write-LogSuccess "Python environment setup complete."
    } finally {
        Pop-Location
    }
}

function Setup-DjangoEnvironment {
    Write-LogInfo "Setting up Django environment..."
    $backendDir = Join-Path $PROD_DIR "backend\django"
    $pythonVenv = Join-Path $VENV_DIR "Scripts\python.exe"

    Push-Location $backendDir

    try {
        if (!$SkipMigrate) {
            Write-LogInfo "Running Django migrations..."
            & $pythonVenv manage.py migrate
        } else {
            Write-LogInfo "Skipping Django migrations as requested."
        }

        Write-LogInfo "Collecting static files..."
        & $pythonVenv manage.py collectstatic --noinput

        Write-LogInfo "Checking for admin superuser..."
        $checkSuperuserScript = "from django.contrib.auth import get_user_model; User = get_user_model(); exit(0) if User.objects.filter(username='admin').exists() else exit(1)"
        & $pythonVenv manage.py shell -c $checkSuperuserScript
        
        if ($LASTEXITCODE -ne 0) {
            Write-LogInfo "Creating superuser 'admin' with password 'admin'..."
            $createSuperuserScript = "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin')"
            Write-Output $createSuperuserScript | & $pythonVenv manage.py shell
        } else {
            Write-LogInfo "Superuser 'admin' already exists."
        }

        Write-LogSuccess "Django environment setup complete."
    } finally {
        Pop-Location
    }
}

function Test-PortConflict {
    param(
        [int]$Port,
        [string]$ServiceName
    )
    Write-LogInfo "Checking for process on port $Port..."
    
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-LogWarn "Port $Port is in use by PID $($process.Id) ($($process.ProcessName))"
            if ($Force) {
                Write-LogInfo "'-Force' specified: terminating process..."
                $process | Stop-Process -Force
                Start-Sleep -Seconds 1
                Write-LogSuccess "Process terminated."
            } else {
                Write-LogError "Port conflict detected for $ServiceName. Stop the process manually or use '-Force'."
                return $false
            }
        }
    }
    
    Write-LogSuccess "Port $Port is free for $ServiceName."
    return $true
}

function Start-BackendServer {
    Write-LogInfo "Starting Django backend server..."
    Test-Environment
    if (!(Test-PortConflict $BACKEND_PORT "backend")) { exit 1 }

    $backendDir = Join-Path $PROD_DIR "backend\django"
    $pythonVenv = Join-Path $VENV_DIR "Scripts\python.exe"

    if (!(Test-Path $pythonVenv)) {
        Write-LogError "Python virtual environment not found at '$pythonVenv'. Please run setup first."
        return $false
    }
    if (!(Test-Path (Join-Path $backendDir "manage.py"))) {
        Write-LogError "manage.py not found in '$backendDir'."
        return $false
    }

    # Clear and create log file
    "" | Out-File -FilePath $BACKEND_LOG -Encoding UTF8

    Push-Location $backendDir
    try {
        # Start Django server as background job
        $djangoJob = Start-Job -ScriptBlock {
            param($pythonPath, $port, $logFile, $backendDir)
            Set-Location $backendDir
            try {
                & $pythonPath manage.py runserver 0.0.0.0:$port | Tee-Object -FilePath $logFile
            } catch {
                $_.Exception.Message | Tee-Object -FilePath $logFile -Append
            }
        } -ArgumentList $pythonVenv, $BACKEND_PORT, $BACKEND_LOG, $backendDir

        # Store the job ID for later reference
        $djangoJob.Id | Out-File -FilePath $BACKEND_PID_FILE -Encoding ascii

        # Wait a moment for the server to start
        Start-Sleep -Seconds 2

        # Check if the job is still running
        if ($djangoJob.State -eq "Running") {
            Write-LogSuccess "Django backend server is running (Job ID: $($djangoJob.Id))."
            Write-LogInfo "Backend should be available at http://localhost:$BACKEND_PORT"
            return $true
        } else {
            # Get job output if it failed
            $jobOutput = Receive-Job $djangoJob
            $jobError = Receive-Job $djangoJob -Error
            Remove-Job $djangoJob

            Write-LogError "Django backend server failed to start. Check logs: $BACKEND_LOG"
            if ($jobOutput) { Write-LogError "Output: $jobOutput" }
            if ($jobError) { Write-LogError "Error: $jobError" }
            return $false
        }
    } finally {
        Pop-Location
    }
}

function Start-FrontendServer {
    Write-LogInfo "Starting React frontend development server..."
    Test-Environment
    if (!(Test-PortConflict $FRONTEND_PORT "frontend")) { exit 1 }

    $frontendDir = Join-Path $PROD_DIR "frontend"
    Push-Location $frontendDir
    
    try {
        if (!(Test-Path "node_modules") -or $ForceNpmInstall) {
            if ($ForceNpmInstall) {
                Write-LogInfo "-ForceNpmInstall specified: running 'npm install' regardless of node_modules presence..."
            } else {
                Write-LogInfo "Installing frontend dependencies with 'npm install'..."
            }
            npm install
        }

        # Clear and create log file
        "" | Out-File -FilePath $FRONTEND_LOG -Encoding UTF8

        # Start frontend server as background job
        $frontendJob = Start-Job -ScriptBlock {
            param($frontendDir, $logFile)
            Set-Location $frontendDir
            try {
                npm run dev | Tee-Object -FilePath $logFile
            } catch {
                $_.Exception.Message | Tee-Object -FilePath $logFile -Append
            }
        } -ArgumentList $frontendDir, $FRONTEND_LOG

        # Store the job ID for later reference
        $frontendJob.Id | Out-File -FilePath $FRONTEND_PID_FILE -Encoding ascii

        # Wait a moment for the server to start
        Start-Sleep -Seconds 3

        # Check if the job is still running
        if ($frontendJob.State -eq "Running") {
            Write-LogSuccess "React frontend server is running (Job ID: $($frontendJob.Id))."
            Write-LogInfo "Frontend should be available at http://localhost:$FRONTEND_PORT"
            return $true
        } else {
            # Get job output if it failed
            $jobOutput = Receive-Job $frontendJob
            $jobError = Receive-Job $frontendJob -Error
            Remove-Job $frontendJob

            Write-LogError "React frontend server failed to start. Check logs: $FRONTEND_LOG"
            if ($jobOutput) { Write-LogError "Output: $jobOutput" }
            if ($jobError) { Write-LogError "Error: $jobError" }
            return $false
        }
    } finally {
        Pop-Location
    }
}

function Stop-Services {
    Write-LogInfo "Stopping all services..."
    
    # Stop backend
    if (Test-Path $BACKEND_PID_FILE) {
        $jobId = Get-Content $BACKEND_PID_FILE
        try {
            $job = Get-Job -Id $jobId -ErrorAction Stop
            if ($job) {
                Write-LogInfo "Stopping Django backend server (Job ID: $jobId)..."
                Stop-Job $job
                Remove-Job $job
                Write-LogSuccess "Django backend server stopped."
            } else {
                Write-LogWarn "Stale backend PID file found; removing."
            }
        } catch {
            Write-LogWarn "Stale backend PID file found; removing."
        } finally {
            Remove-Item $BACKEND_PID_FILE -Force
        }
    } else {
        Write-LogInfo "No backend PID file found."
    }
    
    # Stop frontend
    if (Test-Path $FRONTEND_PID_FILE) {
        $jobId = Get-Content $FRONTEND_PID_FILE
        try {
            $job = Get-Job -Id $jobId -ErrorAction Stop
            if ($job) {
                Write-LogInfo "Stopping React frontend server (Job ID: $jobId)..."
                Stop-Job $job
                Remove-Job $job
                Write-LogSuccess "React frontend server stopped."
            } else {
                Write-LogWarn "Stale frontend PID file found; removing."
            }
        } catch {
            Write-LogWarn "Stale frontend PID file found; removing."
        } finally {
            Remove-Item $FRONTEND_PID_FILE -Force
        }
    } else {
        Write-LogInfo "No frontend PID file found."
    }
    
    Write-LogSuccess "Stop command finished."
}

function Show-Status {
    Write-LogInfo "Checking service status..."

    Write-LogInfo "Django Backend Server:"
    if (Test-Path $BACKEND_PID_FILE) {
        $jobId = Get-Content $BACKEND_PID_FILE
        $job = Get-Job -Id $jobId -ErrorAction SilentlyContinue
        if ($job -and $job.State -eq "Running") {
            Write-LogSuccess "Django backend server is RUNNING (Job ID: $jobId)."
            try {
                Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/" -TimeoutSec 5 -UseBasicParsing | Out-Null
                Write-LogSuccess "Django backend server is responding at http://localhost:$BACKEND_PORT/"
            } catch {
                Write-LogWarn "Django backend server process is running, but NOT RESPONDING."
            }
        } else {
            Write-LogError "Django backend server is STOPPED. Removing stale PID file."
            Remove-Item $BACKEND_PID_FILE -Force
        }
    } else {
        Write-LogInfo "Django backend server is STOPPED (no PID file found)."
    }

    Write-LogInfo "React Frontend Server:"
    if (Test-Path $FRONTEND_PID_FILE) {
        $jobId = Get-Content $FRONTEND_PID_FILE
        $job = Get-Job -Id $jobId -ErrorAction SilentlyContinue
        if ($job -and $job.State -eq "Running") {
            Write-LogSuccess "React frontend server is RUNNING (Job ID: $jobId)."
            try {
                Invoke-WebRequest -Uri "http://localhost:$FRONTEND_PORT/" -TimeoutSec 5 -UseBasicParsing | Out-Null
                Write-LogSuccess "React frontend server is responding at http://localhost:$FRONTEND_PORT/"
            } catch {
                Write-LogWarn "React frontend server is running, but NOT RESPONDING."
            }
        } else {
            Write-LogError "React frontend server is STOPPED. Removing stale PID file."
            Remove-Item $FRONTEND_PID_FILE -Force
        }
    } else {
        Write-LogInfo "React frontend server is STOPPED (no PID file found)."
    }
}

function Show-Logs {
    Write-LogInfo "Available log files:"
    Write-LogInfo "  Backend:  $BACKEND_LOG"
    Write-LogInfo "  Frontend: $FRONTEND_LOG"
    Write-LogInfo "  Main:     $LOG_FILE"
    Write-Host ""
    Write-LogInfo "Showing backend logs. Press Ctrl+C to exit."
    if (Test-Path $BACKEND_LOG) {
        Get-Content $BACKEND_LOG -Wait -Tail 10
    } else {
        Write-LogWarn "Backend log file not found at '$BACKEND_LOG'."
    }
}

function Show-AccessInfo {
    Write-Host "" | Tee-Object -FilePath $LOG_FILE
    Write-LogSuccess "Production 1 is now running with separate services!"
    Write-Host "" | Tee-Object -FilePath $LOG_FILE
    Write-LogInfo "Access Information:"
    Write-Host "   - Frontend (Dev):     http://localhost:$FRONTEND_PORT" | Tee-Object -FilePath $LOG_FILE
    Write-Host "   - Backend (API):      http://localhost:$BACKEND_PORT" | Tee-Object -FilePath $LOG_FILE
    Write-Host "   - API Endpoint:       http://localhost:$BACKEND_PORT/api/v1/" | Tee-Object -FilePath $LOG_FILE
    Write-Host "   - Admin Panel:        http://localhost:$BACKEND_PORT/admin/ (user: admin, pass: admin)" | Tee-Object -FilePath $LOG_FILE
    Write-Host "" | Tee-Object -FilePath $LOG_FILE
    Write-LogInfo "Cloudflare Tunnel Setup:"
    Write-Host "   - Frontend Tunnel:    https://$DEV_FRONTEND_DOMAIN/ → localhost:$FRONTEND_PORT" | Tee-Object -FilePath $LOG_FILE
    Write-Host "   - Backend Tunnel:     https://$DEV_API_DOMAIN/ → localhost:$BACKEND_PORT" | Tee-Object -FilePath $LOG_FILE
    Write-Host "" | Tee-Object -FilePath $LOG_FILE
    Write-LogInfo "Log Files:"
    Write-Host "   - Backend Log:        $BACKEND_LOG" | Tee-Object -FilePath $LOG_FILE
    Write-Host "   - Frontend Log:       $FRONTEND_LOG" | Tee-Object -FilePath $LOG_FILE
    Write-Host "   - Main Log:           $LOG_FILE" | Tee-Object -FilePath $LOG_FILE
}

# =============================================================================
# MAIN OPERATIONS
# =============================================================================

function Start-AllServices {
    Write-LogInfo "Executing 'start' command..."
    Test-Environment
    
    # User rule: always run venv first
    Setup-PythonEnvironment
    
    # Build frontend BEFORE collectstatic so latest assets are collected
    Build-Frontend
    Setup-DjangoEnvironment
    
    # Start backend first
    if (Start-BackendServer) {
        Write-LogSuccess "Backend started successfully."
    } else {
        Write-LogError "Failed to start backend. Please check the logs."
        exit 1
    }
    
    # Start frontend
    if (Start-FrontendServer) {
        Write-LogSuccess "Frontend started successfully."
        Show-AccessInfo
    } else {
        Write-LogError "Failed to start frontend. Please check the logs."
        exit 1
    }
}

# =============================================================================
# MAIN SCRIPT LOGIC
# =============================================================================

# Handle RunOnly flag
if ($RunOnly) {
    $SkipBuild = $true
    $SkipMigrate = $true
}

# Check if running as administrator
if (([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-LogWarn "Running as administrator is not recommended and may cause permission issues."
}

# Announce mode
if ($RunOnly) {
    Write-LogInfo "Mode: RUN-ONLY (skipping build and migrations)."
} elseif ($SkipBuild -or $SkipMigrate) {
    if ($SkipBuild) { Write-LogInfo "Mode: Skipping frontend build." }
    if ($SkipMigrate) { Write-LogInfo "Mode: Skipping Django migrations." }
}

switch ($Command) {
    "start" {
        Start-AllServices
    }
    "start-backend" {
        if ($RunOnly) { Write-LogInfo "Mode: RUN-ONLY (skipping migrations)." }
        Test-Environment
        Setup-PythonEnvironment
        Build-Frontend
        Setup-DjangoEnvironment
        Start-BackendServer
    }
    "start-frontend" {
        Test-Environment
        Start-FrontendServer
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Stop-Services
        Start-Sleep -Seconds 1
        Start-AllServices
    }
    "status" {
        Show-Status
    }
    "logs" {
        Show-Logs
    }
    "config" {
        Write-LogInfo "Configuration loaded from setup_env.ps1:"
        Write-LogInfo "  Backend Port: $BACKEND_PORT"
        Write-LogInfo "  Frontend Port: $FRONTEND_PORT"
        Write-LogInfo "  API Domain: $DEV_API_DOMAIN"
        Write-LogInfo "  Frontend Domain: $DEV_FRONTEND_DOMAIN"
        Write-LogInfo "  Virtual Environment: $VENV_DIR"
        Write-LogInfo "  Python Path: $VENV_DIR\Scripts\python.exe"
    }
    "help" {
        Show-Help
    }
    default {
        Write-LogError "Unknown command: '$Command'"
        Show-Help
        exit 1
    }
}