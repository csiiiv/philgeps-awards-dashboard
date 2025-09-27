# Local Server Runner for Production 1: Unified Parquet Architecture (Windows)
# This script builds the React frontend and runs Django on port 3200
# Usage: .\run_local.ps1 [start|stop|restart|status|logs]
# Version: 2.0.0 (Overhauled for stability and clarity)

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "start-frontend", "start-backend", "stop", "restart", "status", "logs", "help")]
    [string]$Command = "start",
    
    [switch]$SkipBuild,
    [switch]$SkipMigrate,
    [switch]$RunOnly,
    [switch]$Force,
    [switch]$DebugOutput
)

# --- Script Configuration ---
# Stop script on any error
$ErrorActionPreference = "Stop"

# Use the script's directory to derive project paths dynamically.
# Handle cases where PSScriptRoot might be empty
if ($PSScriptRoot) {
    $SCRIPT_DIR = $PSScriptRoot
    $PROD_DIR = $PSScriptRoot
} else {
    # Fallback: use the directory of the current script
    $SCRIPT_DIR = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
    $PROD_DIR = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

# Debug mode flag - can be enabled via command line parameter or set here
$DEBUG_MODE = $DebugOutput

# Debug: Display path information when debug mode is enabled
if ($DEBUG_MODE) {
    Write-Host "=== PATH DEBUGGING INFORMATION ===" -ForegroundColor Yellow
    Write-Host "Script Directory: $SCRIPT_DIR" -ForegroundColor Cyan
    Write-Host "Project Directory: $PROD_DIR" -ForegroundColor Cyan
    Write-Host "Current Working Directory: $(Get-Location)" -ForegroundColor Cyan
    Write-Host "PSScriptRoot: '$PSScriptRoot'" -ForegroundColor Magenta
    Write-Host "MyInvocation.MyCommand.Definition: '$($MyInvocation.MyCommand.Definition)'" -ForegroundColor Magenta
    Write-Host "=================================" -ForegroundColor Yellow
}
$PORT = 3200
$LOGS_DIR = Join-Path -Path $SCRIPT_DIR -ChildPath "logs"
$PID_FILE = Join-Path -Path $LOGS_DIR -ChildPath "prod1_local.pid"

# Create logs directory if it doesn't exist. This is the first action.
if (!(Test-Path $LOGS_DIR)) {
    New-Item -ItemType Directory -Path $LOGS_DIR -Force | Out-Null
}
$LOG_FILE = Join-Path -Path $LOGS_DIR -ChildPath "prod1_local_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# --- Global Options ---
# Combine RunOnly with other flags for simplicity, as seen in the .sh version.
if ($RunOnly) {
    $SkipBuild = $true
    $SkipMigrate = $true
}

# --- Enhanced Logging ---
# A single function to write to both the console and a log file, similar to 'tee'.
# This fixes the "silent execution" bug.
function Write-Log {
    param(
        [string]$Message,
        [string]$Color = "Green"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    
    # Write to console. This avoids the tricky scriptblock formatting.
    Write-Host $logMessage -ForegroundColor $Color

    # Append the same message to the log file.
    Add-Content -Path $LOG_FILE -Value $logMessage
}

# Helper logging functions with icons for clarity.
function Write-LogError { param([string]$Message) Write-Log "ERROR: $Message" "Red" }
function Write-LogWarning { param([string]$Message) Write-Log "WARN: $Message" "Yellow" }
function Write-LogInfo { param([string]$Message) Write-Log "INFO: $Message" "Cyan" }
function Write-LogSuccess { param([string]$Message) Write-Log "SUCCESS: $Message" "Green" }

# Debug logging function (only outputs when DEBUG_MODE is enabled)
function Write-DebugInfo { 
    param([string]$Message) 
    if ($DEBUG_MODE) { 
        Write-Log "DEBUG: $Message" "Yellow" 
    } 
}

# --- Environment and Prerequisite Checks ---

# Function to check if a command (like 'python' or 'npm') exists and is executable.
function Test-CommandExists {
    param([string]$Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

# Central function to validate the environment before running.
function Test-Environment {
    Write-LogInfo "Checking environment setup..."
    
    $backendPath = Join-Path -Path $PROD_DIR -ChildPath "backend"
    $frontendPath = Join-Path -Path $PROD_DIR -ChildPath "frontend"
    
    Write-DebugInfo "Checking backend path: $backendPath"
    Write-DebugInfo "Backend exists: $(Test-Path $backendPath)"
    Write-DebugInfo "Checking frontend path: $frontendPath"
    Write-DebugInfo "Frontend exists: $(Test-Path $frontendPath)"
    
    if (!(Test-Path $backendPath) -or !(Test-Path $frontendPath)) {
        Write-LogError "Project structure is incorrect. Please run this script from the project root."
        Write-LogError "Expected to find 'backend' and 'frontend' directories in '$PROD_DIR'."
        Write-LogError "Backend path: $backendPath (exists: $(Test-Path $backendPath))"
        Write-LogError "Frontend path: $frontendPath (exists: $(Test-Path $frontendPath))"
        exit 1
    }
    
    $checks = @{
        "python" = "Python is not installed. Visit: https://www.python.org/downloads/";
        "pip"    = "pip is not installed. Please ensure it's included with your Python installation.";
        "node"   = "Node.js is not installed. Visit: https://nodejs.org/";
        "npm"    = "npm is not installed. It should be included with Node.js.";
    }
    
    foreach ($command in $checks.Keys) {
        if (!(Test-CommandExists $command)) {
            Write-LogError $checks[$command]
            exit 1
        }
    }
    
    Write-LogSuccess "Environment check passed."
}

# --- Core Service Functions ---

# Function to build the React frontend.
function Build-Frontend {
    Write-LogInfo "Building React frontend..."
    Push-Location (Join-Path -Path $PROD_DIR -ChildPath "frontend")
    
    try {
        if (!(Test-Path "node_modules")) {
            Write-LogInfo "Installing frontend dependencies with 'npm install'..."
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

# Function to start the React development server in a separate PowerShell window.
function Start-FrontendServer {
    Write-LogInfo "Starting React development server..."
    $frontendDir = Join-Path -Path $PROD_DIR -ChildPath "frontend"
    $frontendLog = Join-Path -Path $LOGS_DIR -ChildPath "frontend_dev.log"
    $frontendPidFile = Join-Path -Path $LOGS_DIR -ChildPath "frontend_dev.pid"
    
    # Create a PowerShell script file for proper output redirection
    $scriptContent = @"
Set-Location '$frontendDir'
Write-Host "Starting React development server..." -ForegroundColor Green
Write-Host "This window will stay open while the server is running." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server, or close this window." -ForegroundColor Yellow
Write-Host ""

# Set error action to continue so we can catch all errors
`$ErrorActionPreference = "Continue"

# Function to pause and show error
function Show-ErrorAndPause {
    param([string]`$ErrorMessage)
    Write-Host ""
    Write-Host "Frontend server encountered an error:" -ForegroundColor Red
    Write-Host `$ErrorMessage -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to close this window..." -ForegroundColor Yellow
    `$null = `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check if npm exists
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Show-ErrorAndPause "npm command not found. Please ensure Node.js is installed and in your PATH."
}

# Check if package.json exists
if (!(Test-Path "package.json")) {
    Show-ErrorAndPause "package.json not found in current directory. Are you in the correct frontend directory?"
}

# Run npm with explicit error handling
Write-Host "Running: npm run dev" -ForegroundColor Cyan
`$npmProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru -RedirectStandardOutput "temp_output.txt" -RedirectStandardError "temp_error.txt"

# Wait for the process to complete or be interrupted
`$npmProcess.WaitForExit()

# Check if there was an error
if (`$npmProcess.ExitCode -ne 0) {
    `$errorOutput = Get-Content "temp_error.txt" -ErrorAction SilentlyContinue
    `$stdOutput = Get-Content "temp_output.txt" -ErrorAction SilentlyContinue
    
    # Combine outputs and write to log
    `$allOutput = @()
    if (`$stdOutput) { `$allOutput += `$stdOutput }
    if (`$errorOutput) { `$allOutput += `$errorOutput }
    `$allOutput | Add-Content -Path '$frontendLog'
    
    Show-ErrorAndPause "npm run dev failed with exit code `$(`$npmProcess.ExitCode). Check the log file for details."
} else {
    # Process completed successfully, but let's still pause
    Write-Host ""
    Write-Host "Frontend server process completed." -ForegroundColor Green
    Write-Host "Press any key to close this window..." -ForegroundColor Yellow
    `$null = `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Cleanup temp files
Remove-Item "temp_output.txt" -ErrorAction SilentlyContinue
Remove-Item "temp_error.txt" -ErrorAction SilentlyContinue
"@
    $scriptFile = Join-Path -Path $LOGS_DIR -ChildPath "start_frontend.ps1"
    $scriptContent | Out-File -FilePath $scriptFile -Encoding UTF8
    
    # Start the frontend dev server using the script file
    $process = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $scriptFile -WorkingDirectory $frontendDir -WindowStyle Normal -PassThru
    
    if ($process) {
        # Store the frontend process ID
        $process.Id | Out-File -FilePath $frontendPidFile -Encoding ascii
        Write-LogInfo "Frontend development server started with PID $($process.Id)."
        Write-LogInfo "Frontend dev server should be available at http://localhost:5173/"
        Write-LogInfo "Frontend output is being logged to: $frontendLog"
        return $true
    } else {
        Write-LogError "Failed to start frontend development server."
        return $false
    }
}

# Function to set up the Python virtual environment and install dependencies.
function Setup-PythonEnvironment {
    Write-LogInfo "Setting up Python environment..."
    $backendDir = Join-Path -Path $PROD_DIR -ChildPath "backend\django"
    $venvDir = Join-Path -Path $PROD_DIR -ChildPath "venv"
    
    Write-DebugInfo "Backend directory: $backendDir"
    Write-DebugInfo "Backend directory exists: $(Test-Path $backendDir)"
    Write-DebugInfo "Virtual environment directory: $venvDir"
    Write-DebugInfo "Virtual environment exists: $(Test-Path $venvDir)"
    Write-DebugInfo "Current working directory before Push-Location: $(Get-Location)"
    
    Push-Location $backendDir
    
    Write-DebugInfo "Current working directory after Push-Location: $(Get-Location)"

    try {
        if (!(Test-Path $venvDir)) {
            Write-LogInfo "Creating Python virtual environment at '$venvDir'..."
            python -m venv $venvDir
        }
        
        # Define paths to python and pip inside the venv for robust execution.
        $pythonVenv = Join-Path -Path $venvDir -ChildPath "Scripts\python.exe"
        $pipVenv = Join-Path -Path $venvDir -ChildPath "Scripts\pip.exe"

        # --- Verification Step ---
        if (!(Test-Path $pythonVenv) -or !(Test-Path $pipVenv)) {
            Write-LogError "Virtual environment is corrupted or was not created successfully."
            Write-LogError "Could not find executables at '$pythonVenv' and '$pipVenv'."
            Write-LogInfo "Try deleting the '$venvDir' directory and running the script again."
            exit 1
        }

        if (Test-Path "requirements.txt") {
            Write-LogInfo "Installing Python dependencies from requirements.txt..."
            & $pipVenv install -r requirements.txt
        } else {
            Write-LogWarning "'requirements.txt' not found. Installing essential dependencies..."
            & $pipVenv install django djangorestframework django-cors-headers django-filter whitenoise gunicorn duckdb pandas
        }
        Write-LogSuccess "Python environment setup complete."
    } finally {
        Pop-Location
    }
}

# Function to run Django migrations and collect static files.
function Setup-DjangoEnvironment {
    Write-LogInfo "Setting up Django environment..."
    $backendDir = Join-Path -Path $PROD_DIR -ChildPath "backend\django"
    $pythonVenv = Join-Path -Path $PROD_DIR -ChildPath "venv\Scripts\python.exe"
    
    # Write-Host "DEBUG: Backend directory: $backendDir" -ForegroundColor Yellow
    # Write-Host "DEBUG: Backend directory exists: $(Test-Path $backendDir)" -ForegroundColor Yellow
    # Write-Host "DEBUG: Python executable path: $pythonVenv" -ForegroundColor Yellow
    # Write-Host "DEBUG: Python executable exists: $(Test-Path $pythonVenv)" -ForegroundColor Yellow
    # Write-Host "DEBUG: Current working directory before Push-Location: $(Get-Location)" -ForegroundColor Yellow
    
    Push-Location $backendDir
    
    Write-DebugInfo "Current working directory after Push-Location: $(Get-Location)"

    try {
        if (!$SkipMigrate) {
            Write-LogInfo "Running Django migrations..."
            Write-DebugInfo "Executing command: $pythonVenv manage.py migrate"
            & $pythonVenv manage.py migrate
        } else {
            Write-LogInfo "Skipping Django migrations as requested."
        }
        
        Write-LogInfo "Collecting static files..."
        Write-DebugInfo "Executing command: $pythonVenv manage.py collectstatic --noinput"
        & $pythonVenv manage.py collectstatic --noinput
        
        Write-LogInfo "Checking for admin superuser..."
        $checkSuperuserScript = "from django.contrib.auth import get_user_model; User = get_user_model(); exit(0) if User.objects.filter(username='admin').exists() else exit(1)"
        & $pythonVenv manage.py shell -c $checkSuperuserScript
        
        if ($LASTEXITCODE -ne 0) {
            Write-LogInfo "Creating superuser 'admin' with password 'admin'..."
            $createSuperuserScript = "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin')"
            echo $createSuperuserScript | & $pythonVenv manage.py shell
        } else {
            Write-LogInfo "Superuser 'admin' already exists."
        }

        Write-LogSuccess "Django environment setup complete."
    } finally {
        Pop-Location
    }
}

# Function to check for and optionally kill processes using the target port.
function Test-PortConflict {
    Write-LogInfo "Checking for process on port $PORT..."
    $connection = Get-NetTCPConnection -LocalPort $PORT -ErrorAction SilentlyContinue
    
    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-LogWarning "Port $PORT is currently in use by PID $($process.Id) ($($process.ProcessName))."
            if ($Force) {
                Write-LogInfo "'-Force' specified: Stopping process..."
                $process | Stop-Process -Force
                Start-Sleep -Seconds 2
                Write-LogSuccess "Process terminated."
                return $true
            } else {
                Write-LogError "Port conflict detected. Stop the process manually or use the '-Force' flag."
                return $false
            }
        }
    }
    
    Write-LogSuccess "Port $PORT is free."
    return $true
}

# Function to start the Django server using Start-Process for better control.
function Start-DjangoServer {
    Write-LogInfo "Starting Django server..."
    if (!(Test-PortConflict)) {
        exit 1
    }
    
    $backendDir = Join-Path -Path $PROD_DIR -ChildPath "backend\django"
    $pythonVenv = Join-Path -Path $PROD_DIR -ChildPath "venv\Scripts\python.exe"
    $djangoLog = Join-Path -Path $LOGS_DIR -ChildPath "django_prod1.log"
    
    Write-Host "DEBUG: Backend directory: $backendDir" -ForegroundColor Yellow
    Write-Host "DEBUG: Backend directory exists: $(Test-Path $backendDir)" -ForegroundColor Yellow
    Write-Host "DEBUG: Python executable path: $pythonVenv" -ForegroundColor Yellow
    Write-Host "DEBUG: Python executable exists: $(Test-Path $pythonVenv)" -ForegroundColor Yellow
    Write-Host "DEBUG: Django log file: $djangoLog" -ForegroundColor Yellow
    Write-Host "DEBUG: Django log directory exists: $(Test-Path (Split-Path $djangoLog -Parent))" -ForegroundColor Yellow
    Write-Host "DEBUG: Current working directory: $(Get-Location)" -ForegroundColor Yellow

    # Run Django directly in the same window instead of creating a separate process
    Write-LogInfo "Starting Django server directly..."
    
    # Change to the backend directory
    Push-Location $backendDir
    
    try {
        # Check if Python virtual environment exists
        if (!(Test-Path $pythonVenv)) {
            Write-LogError "Python virtual environment not found at '$pythonVenv'. Please run the setup first."
            return $false
        }

        # Check if manage.py exists
        if (!(Test-Path "manage.py")) {
            Write-LogError "manage.py not found in current directory. Are you in the correct Django directory?"
            return $false
        }

        # Test if we can run Python at all
        Write-LogInfo "Testing Python executable..."
        try {
            $testProcess = Start-Process -FilePath $pythonVenv -ArgumentList "--version" -NoNewWindow -PassThru -RedirectStandardOutput "test_output.txt" -RedirectStandardError "test_error.txt"
            $testProcess.WaitForExit()
            
            $testOutput = Get-Content "test_output.txt" -ErrorAction SilentlyContinue
            $testError = Get-Content "test_error.txt" -ErrorAction SilentlyContinue
            
            Write-Host "Python test output: $testOutput" -ForegroundColor Green
            if ($testError) { Write-Host "Python test error: $testError" -ForegroundColor Yellow }
            
            Remove-Item "test_output.txt" -ErrorAction SilentlyContinue
            Remove-Item "test_error.txt" -ErrorAction SilentlyContinue
        } catch {
            Write-LogError "Failed to test Python executable: $($_.Exception.Message)"
            return $false
        }

        # Start Django server as a background job
        Write-LogInfo "Starting Django server as background job..."
        $djangoJob = Start-Job -ScriptBlock {
            param($pythonPath, $port, $logFile, $backendDir)
            Set-Location $backendDir
            try {
                & $pythonPath manage.py runserver 0.0.0.0:$port | Tee-Object -FilePath $logFile
            } catch {
                $_.Exception.Message | Tee-Object -FilePath $logFile -Append
            }
        } -ArgumentList $pythonVenv, $PORT, $djangoLog, $backendDir

        # Store the job ID for later reference
        $djangoJob.Id | Out-File -FilePath $PID_FILE -Encoding ascii
        
        # Wait a moment for the server to start
        Start-Sleep -Seconds 3
        
        # Check if the job is still running
        if ($djangoJob.State -eq "Running") {
            Write-LogSuccess "Django server is running successfully!"
            Write-LogInfo "Server should be available at http://localhost:$PORT"
            return $true
        } else {
            # Get job output if it failed
            $jobOutput = Receive-Job $djangoJob
            $jobError = Receive-Job $djangoJob -Error
            Remove-Job $djangoJob
            
            Write-LogError "Django server failed to start."
            if ($jobOutput) { Write-LogError "Output: $jobOutput" }
            if ($jobError) { Write-LogError "Error: $jobError" }
            return $false
        }
        
    } finally {
        Pop-Location
    }
}

# --- Command Functions ---

# Main function to start all services.
function Start-Services {
    Write-LogInfo "Executing 'start' command..."
    
    Test-Environment
    
    if (!$SkipBuild) {
        Build-Frontend
    } else {
        Write-LogInfo "Skipping frontend build as requested."
    }
    
    Setup-PythonEnvironment
    Setup-DjangoEnvironment # Note: Migrations inside are skipped if -SkipMigrate or -RunOnly is used.
    
    if (Start-DjangoServer) {
        Show-AccessInfo
    } else {
        Write-LogError "Failed to start services. Please check the logs."
        exit 1
    }
}

# Function to stop running services by killing the PIDs.
function Stop-Services {
    Write-LogInfo "Executing 'stop' command..."
    
    # Stop Django server (PowerShell job)
    if (Test-Path $PID_FILE) {
        $jobId = Get-Content $PID_FILE
        try {
            $job = Get-Job -Id $jobId -ErrorAction Stop
            if ($job) {
                Write-LogInfo "Stopping Django server job (Job ID: $jobId)..."
                Stop-Job $job
                Remove-Job $job
                Write-LogSuccess "Django server stopped."
            } else {
                Write-LogWarning "A PID file was found for Django job $jobId, but no such job is running."
            }
        } catch {
            Write-LogWarning "A PID file was found for Django job $jobId, but no such job is running."
        } finally {
            Remove-Item $PID_FILE -Force
        }
    } else {
        Write-LogInfo "No Django PID file found."
    }
    
    # Stop Frontend server
    $frontendPidFile = Join-Path -Path $LOGS_DIR -ChildPath "frontend_dev.pid"
    if (Test-Path $frontendPidFile) {
        $frontendProcessId = Get-Content $frontendPidFile
        try {
            $frontendProcess = Get-Process -Id $frontendProcessId -ErrorAction Stop
            Write-LogInfo "Stopping Frontend server process (PID: $frontendProcessId)..."
            $frontendProcess | Stop-Process -Force
            Write-LogSuccess "Frontend server stopped."
        } catch {
            Write-LogWarning "A PID file was found for Frontend PID $frontendProcessId, but no such process is running."
        } finally {
            Remove-Item $frontendPidFile -Force
        }
    } else {
        Write-LogInfo "No Frontend PID file found."
    }
    
    # Clean up temporary script files
    $tempScripts = @(
        (Join-Path -Path $LOGS_DIR -ChildPath "start_frontend.ps1"),
        (Join-Path -Path $LOGS_DIR -ChildPath "start_django.ps1")
    )
    
    foreach ($script in $tempScripts) {
        if (Test-Path $script) {
            Remove-Item $script -Force
            Write-LogInfo "Cleaned up temporary script: $script"
        }
    }
    
    Write-LogSuccess "Stop command finished."
}

# Function to show the status of the services.
function Show-Status {
    Write-LogInfo "Checking service status..."
    
    # Check Django server
    Write-LogInfo "Django Server:"
    if (Test-Path $PID_FILE) {
        $jobId = Get-Content $PID_FILE
        $job = Get-Job -Id $jobId -ErrorAction SilentlyContinue
        if ($job -and $job.State -eq "Running") {
            Write-LogSuccess "Django server is RUNNING (Job ID: $jobId)."
            try {
                Invoke-WebRequest -Uri "http://localhost:$PORT/" -TimeoutSec 5 -UseBasicParsing
                Write-LogSuccess "Django server is responding at http://localhost:$PORT/"
            } catch {
                Write-LogWarning "Django server job is running, but it is NOT RESPONDING to requests."
            }
        } else {
            Write-LogError "Django server is STOPPED. A stale PID file was found and will be removed."
            Remove-Item $PID_FILE -Force
        }
    } else {
        Write-LogInfo "Django server is STOPPED (no PID file found)."
    }
    
    # Check Frontend server
    Write-LogInfo "Frontend Server:"
    $frontendPidFile = Join-Path -Path $LOGS_DIR -ChildPath "frontend_dev.pid"
    if (Test-Path $frontendPidFile) {
        $frontendProcessId = Get-Content $frontendPidFile
        $frontendProcess = Get-Process -Id $frontendProcessId -ErrorAction SilentlyContinue
        if ($frontendProcess) {
            Write-LogSuccess "Frontend server is RUNNING (PID: $frontendProcessId)."
            try {
                Invoke-WebRequest -Uri "http://localhost:5173/" -TimeoutSec 5 -UseBasicParsing
                Write-LogSuccess "Frontend server is responding at http://localhost:5173/"
            } catch {
                Write-LogWarning "Frontend server process is running, but it is NOT RESPONDING to requests."
            }
        } else {
            Write-LogError "Frontend server is STOPPED. A stale PID file was found and will be removed."
            Remove-Item $frontendPidFile -Force
        }
    } else {
        Write-LogInfo "Frontend server is STOPPED (no PID file found)."
    }
}

# Function to tail the Django log file.
function Show-Logs {
    $djangoLog = Join-Path -Path $LOGS_DIR -ChildPath "django_prod1.log"
    if (Test-Path $djangoLog) {
        Write-LogInfo "Showing logs for Django server. Press Ctrl+C to exit."
        Get-Content $djangoLog -Wait -Tail 10
    } else {
        Write-LogWarning "Django log file not found at '$djangoLog'."
    }
}

# Function to display helpful information.
function Show-AccessInfo {
    Write-Log " " "White" # Spacer
    Write-LogSuccess "Production 1 is now running!"
    Write-Log " " "White"
    Write-LogInfo "Access Information:"
    Write-Log "   - Local Application: http://localhost:$PORT" "White"
    Write-Log "   - API Endpoint:      http://localhost:$PORT/api/v1/" "White"
    Write-Log "   - Admin Panel:       http://localhost:$PORT/admin/ (user: admin, pass: admin)" "White"
    Write-Log " " "White"
    Write-LogInfo "Useful Commands:"
    Write-Log "   - View logs:      .\run_local.ps1 logs" "White"
    Write-Log "   - Check status:   .\run_local.ps1 status" "White"
    Write-Log "   - Stop services:  .\run_local.ps1 stop" "White"
}

# Function to display the help message.
function Show-Help {
    $helpText = @"
Local Server Runner for Production 1: Unified Parquet Architecture (Windows) - v2.0.0

Usage: .\run_local.ps1 [COMMAND] [OPTIONS]

Commands:
  start           Builds, migrates, and starts all services. (Default)
  start-frontend  Starts only the React development server (port 5173)
  start-backend   Starts only the Django server (port 3200)
  stop            Stops all running services.
  restart         Stops and then starts all services.
  status          Checks the current status of all services.
  logs            Tails the Django server log file.
  help            Shows this help message.

Options:
  -SkipBuild    Skips the 'npm run build' step for the frontend.
  -SkipMigrate  Skips the 'manage.py migrate' step for Django.
  -RunOnly      A shortcut for -SkipBuild and -SkipMigrate.
  -Force        Forcibly kills any process using port $PORT before starting.
  -DebugOutput  Enables verbose debug output for troubleshooting.

Examples:
  .\run_local.ps1 start                # Full build and start both servers
  .\run_local.ps1 start-frontend       # Start only React dev server
  .\run_local.ps1 start-backend        # Start only Django server
  .\run_local.ps1 start -SkipBuild     # Start without building the frontend
  .\run_local.ps1 start -RunOnly       # Just run servers, no build or migrations
  .\run_local.ps1 start -DebugOutput   # Start with verbose debug output
  .\run_local.ps1 stop                 # Stop all servers
  .\run_local.ps1 status               # Check status of all servers
"@
    Write-Host $helpText -ForegroundColor Yellow
}

# --- Main Script Logic ---
function Main {
    # Check if running as administrator
    if (([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
        Write-LogWarning "Running as administrator is not recommended and may cause permission issues."
    }
    
    # Announce mode
    if ($RunOnly) {
        Write-LogInfo "Mode: RUN-ONLY (skipping build and migrations)."
    } elseif ($SkipBuild -or $SkipMigrate) {
        if ($SkipBuild) { Write-LogInfo "Mode: Skipping frontend build." }
        if ($SkipMigrate) { Write-LogInfo "Mode: Skipping Django migrations." }
    }
    
    switch ($Command) {
        "start"          { Start-Services }
        "start-frontend" { Start-FrontendServer }
        "start-backend"  { Start-Services }
        "stop"           { Stop-Services }
        "restart"        { Stop-Services; Start-Sleep -Seconds 2; Start-Services }
        "status"         { Show-Status }
        "logs"           { Show-Logs }
        "help"           { Show-Help }
        default          {
            Write-LogError "Unknown command: '$Command'"
            Show-Help
            exit 1
        }
    }
}

# Run the main function
Main