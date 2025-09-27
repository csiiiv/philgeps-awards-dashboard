@echo off
REM Local Server Runner for Production 1: Unified Parquet Architecture (Windows Batch)
REM This script builds the React frontend and runs Django on port 3100
REM Usage: run_local.bat [start|stop|restart|status|logs]

setlocal enabledelayedexpansion

REM Configuration
set "PROD_DIR=C:\Users\Temp\Desktop\production1"
set "SCRIPT_DIR=C:\Users\Temp\Desktop\production1"
set "PORT=3200"
set "LOG_FILE=%SCRIPT_DIR%\logs\prod1_local_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.log"
set "PID_FILE=%SCRIPT_DIR%\logs\prod1_local.pid"

REM Global options
set "SKIP_BUILD=false"
set "SKIP_MIGRATE=false"
set "RUN_ONLY=false"
set "FORCE_KILL=false"

REM Parse command line arguments
set "COMMAND=%~1"
if "%COMMAND%"=="" set "COMMAND=start"

REM Parse options
:parse_args
if "%~1"=="" goto :main
if "%~1"=="--skip-build" set "SKIP_BUILD=true"
if "%~1"=="--skip-migrate" set "SKIP_MIGRATE=true"
if "%~1"=="--run-only" (
    set "RUN_ONLY=true"
    set "SKIP_BUILD=true"
    set "SKIP_MIGRATE=true"
)
if "%~1"=="--force" set "FORCE_KILL=true"
shift
goto :parse_args

:main
REM Create logs directory if it doesn't exist
if not exist "%SCRIPT_DIR%\logs" mkdir "%SCRIPT_DIR%\logs"

REM Show what we're skipping
if "%RUN_ONLY%"=="true" (
    echo [INFO] Mode: RUN-ONLY (skipping build and migrate)
) else (
    if "%SKIP_BUILD%"=="true" echo [INFO] Mode: Skipping frontend build
    if "%SKIP_MIGRATE%"=="true" echo [INFO] Mode: Skipping Django migrations
)

if "%COMMAND%"=="start" goto :start
if "%COMMAND%"=="stop" goto :stop
if "%COMMAND%"=="restart" goto :restart
if "%COMMAND%"=="status" goto :status
if "%COMMAND%"=="logs" goto :logs
if "%COMMAND%"=="help" goto :help
echo [ERROR] Unknown command: %COMMAND%
goto :help

:start
echo [INFO] 🚀 Starting Production 1: Unified Parquet Architecture
echo [INFO] =====================================================

call :check_environment
if errorlevel 1 exit /b 1

REM Build frontend (unless skipped)
if "%SKIP_BUILD%"=="false" (
    call :build_frontend
    if errorlevel 1 exit /b 1
) else (
    echo [INFO] Skipping frontend build (--skip-build)
)

REM Setup Python environment
call :setup_python_environment
if errorlevel 1 exit /b 1

REM Setup Django environment (unless run-only)
if "%RUN_ONLY%"=="false" (
    call :setup_django_environment
    if errorlevel 1 exit /b 1
) else (
    echo [INFO] Skipping Django setup (--run-only)
)

call :start_services
goto :end

:stop
echo [INFO] 🛑 Stopping Production 1: Unified Parquet Architecture
echo [INFO] ====================================================
call :stop_services
goto :end

:restart
echo [INFO] 🔄 Restarting Production 1: Unified Parquet Architecture
echo [INFO] ======================================================
call :stop_services
timeout /t 3 /nobreak >nul
call :start_services
goto :end

:status
call :show_status
goto :end

:logs
call :show_logs
goto :end

:help
echo Local Server Runner for Production 1: Unified Parquet Architecture (Windows)
echo.
echo Usage: run_local.bat [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   start     Build frontend and start Django server on port %PORT%
echo   stop      Stop Django server
echo   restart   Restart Django server
echo   status    Show service status and health
echo   logs      Show service logs
echo   help      Show this help message
echo.
echo Options:
echo   --skip-build    Skip npm build step
echo   --skip-migrate  Skip Django migrations
echo   --run-only      Just run servers (skip build and migrate)
echo   --force         Automatically kill existing processes on the port
echo.
echo Examples:
echo   run_local.bat start                    # Full build and start
echo   run_local.bat start --skip-build       # Skip frontend build
echo   run_local.bat start --skip-migrate     # Skip database migrations
echo   run_local.bat start --run-only         # Just run servers (no build/migrate)
echo   run_local.bat start --force            # Auto-kill existing processes on port
echo   run_local.bat status                   # Check if server is running
echo   run_local.bat logs                     # View logs
echo   run_local.bat stop                     # Stop the server
echo.
echo Usage from project root:
echo   cd %SCRIPT_DIR%
echo   run_local.bat start
echo.
echo This script builds the React frontend and runs Django on localhost:%PORT%
echo Run this script from the project root directory: %SCRIPT_DIR%
echo Make sure you have both backend/ and frontend/ directories in the project root
goto :end

:check_environment
echo [INFO] Checking environment setup...

REM Check if production1 directory exists
if not exist "%PROD_DIR%" (
    echo [ERROR] Production1 directory not found: %PROD_DIR%
    exit /b 1
)

REM Check if we're in the project root directory
if not exist "%SCRIPT_DIR%\backend" (
    echo [ERROR] Please run this script from the project root directory: %SCRIPT_DIR%
    echo [ERROR] Expected structure: {backend,frontend}/
    exit /b 1
)
if not exist "%SCRIPT_DIR%\frontend" (
    echo [ERROR] Please run this script from the project root directory: %SCRIPT_DIR%
    echo [ERROR] Expected structure: {backend,frontend}/
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python first.
    echo [INFO] Visit: https://www.python.org/downloads/
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip is not installed. Please install pip first.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    echo [INFO] Visit: https://nodejs.org/
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

echo [SUCCESS] Environment check passed
exit /b 0

:build_frontend
echo [INFO] Building React frontend...

cd /d "%PROD_DIR%\frontend"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install frontend dependencies
        exit /b 1
    )
) else (
    echo [INFO] Frontend dependencies already installed
)

REM Build the frontend
echo [INFO] Building frontend with Vite...
npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed
    exit /b 1
)

REM Check if build was successful
if exist "dist" if exist "dist\index.html" (
    echo [SUCCESS] Frontend build completed successfully
    echo [INFO] Build output:
    dir dist
) else (
    echo [ERROR] Frontend build failed - dist directory or index.html not found
    exit /b 1
)
exit /b 0

:setup_python_environment
echo [INFO] Setting up Python environment...

cd /d "%PROD_DIR%\backend\django"

REM Check if virtual environment exists
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        exit /b 1
    )
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call "venv\Scripts\activate.bat"

REM Install requirements if requirements.txt exists
if exist "requirements.txt" (
    echo [INFO] Installing Python dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install Python dependencies
        exit /b 1
    )
) else (
    echo [INFO] Installing essential dependencies...
    pip install django djangorestframework django-cors-headers django-filter whitenoise gunicorn duckdb pandas
    if errorlevel 1 (
        echo [ERROR] Failed to install essential dependencies
        exit /b 1
    )
)

echo [SUCCESS] Python environment setup complete
exit /b 0

:setup_django_environment
echo [INFO] Setting up Django environment...

cd /d "%PROD_DIR%\backend\django"
call "venv\Scripts\activate.bat"

REM Run migrations (unless skipped)
if "%SKIP_MIGRATE%"=="false" (
    echo [INFO] Running Django migrations...
    python manage.py migrate
    if errorlevel 1 (
        echo [ERROR] Django migrations failed
        exit /b 1
    )
) else (
    echo [INFO] Skipping Django migrations (--skip-migrate)
)

REM Collect static files
echo [INFO] Collecting static files...
python manage.py collectstatic --noinput
if errorlevel 1 (
    echo [ERROR] Failed to collect static files
    exit /b 1
)

REM Create superuser if it doesn't exist
echo [INFO] Checking for superuser...
python manage.py shell -c "from django.contrib.auth.models import User; print(User.objects.filter(username='admin').exists())" > temp_check.txt 2>nul
set /p superuser_exists=<temp_check.txt
del temp_check.txt 2>nul
if "%superuser_exists%"=="False" (
    echo [INFO] Creating superuser (admin/admin)...
    echo from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@example.com', 'admin') | python manage.py shell
)

echo [SUCCESS] Django environment setup complete
exit /b 0

:check_port_conflict
set "port=%1"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%port%"') do (
    set "pid=%%a"
    if not "!pid!"=="" (
        echo [WARNING] Port %port% is already in use by process ID: !pid!
        if "%FORCE_KILL%"=="true" (
            echo [INFO] Force mode: Killing existing process on port %port%...
            taskkill /PID !pid! /F >nul 2>&1
            timeout /t 2 /nobreak >nul
            echo [SUCCESS] Existing process killed
        ) else (
            set /p response="Do you want to kill this process and continue? (y/N): "
            if /i "!response!"=="y" (
                echo [INFO] Killing existing process on port %port%...
                taskkill /PID !pid! /F >nul 2>&1
                timeout /t 2 /nobreak >nul
                echo [SUCCESS] Existing process killed
            ) else (
                echo [ERROR] Cannot start server - port %port% is in use
                echo [INFO] Please stop the existing process manually or choose a different port
                echo [INFO] Use --force flag to automatically kill existing processes
                exit /b 1
            )
        )
    )
)
exit /b 0

:start_django_server
echo [INFO] Starting Django server on port %PORT%...

REM Check for port conflicts
call :check_port_conflict %PORT%
if errorlevel 1 exit /b 1

cd /d "%PROD_DIR%\backend\django"
call "venv\Scripts\activate.bat"

REM Start Django with runserver for local development
echo [INFO] Starting Django server in background...
start /b python manage.py runserver 0.0.0.0:%PORT% > "%SCRIPT_DIR%\logs\django_prod1.log" 2>&1

REM Wait for server to start
timeout /t 5 /nobreak >nul

REM Check if server is running (simplified check)
echo [INFO] Checking if server is responding...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:%PORT%/' -TimeoutSec 10 -ErrorAction Stop | Out-Null; Write-Host 'SUCCESS' } catch { Write-Host 'FAILED' }" > temp_check.txt
set /p server_status=<temp_check.txt
del temp_check.txt 2>nul

if "%server_status%"=="SUCCESS" (
    echo [SUCCESS] Django server started successfully on port %PORT%
    exit /b 0
) else (
    echo [ERROR] Failed to start Django server
    echo [INFO] Check logs: %SCRIPT_DIR%\logs\django_prod1.log
    exit /b 1
)

:start_services
echo [INFO] Starting Production 1 services...

REM Verify frontend build exists
if not exist "%PROD_DIR%\frontend\dist" (
    echo [ERROR] Frontend build not found. Please run with --skip-build=false to build first.
    exit /b 1
)
if not exist "%PROD_DIR%\frontend\dist\index.html" (
    echo [ERROR] Frontend build not found. Please run with --skip-build=false to build first.
    exit /b 1
)

REM Start Django server
call :start_django_server
if errorlevel 1 exit /b 1

echo [SUCCESS] All services started successfully!
call :show_access_info
exit /b 0

:stop_services
echo [INFO] Stopping all services...

REM Stop Django server (find and kill python processes running on the port)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%"') do (
    taskkill /PID %%a /F >nul 2>&1
    echo [INFO] Stopped process %%a
)

echo [SUCCESS] All services stopped
exit /b 0

:show_status
echo [INFO] Service Status:
echo.

REM Check if Django server is running
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%"') do (
    echo [SUCCESS] Django server is running (PID: %%a)
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:%PORT%/' -TimeoutSec 5 -ErrorAction Stop | Out-Null; Write-Host '[SUCCESS] Django server is responding on port %PORT%' } catch { Write-Host '[WARNING] Django server is running but not responding' }"
    goto :status_done
)
echo [ERROR] Django server is not running

:status_done
exit /b 0

:show_logs
echo [INFO] Showing service logs...

REM Show Django logs
if exist "%SCRIPT_DIR%\logs\django_prod1.log" (
    echo [INFO] Django Server Logs:
    type "%SCRIPT_DIR%\logs\django_prod1.log"
) else (
    echo [WARNING] Django log file not found
)
exit /b 0

:show_access_info
echo.
echo [SUCCESS] 🎉 Production 1: Unified Parquet Architecture is running!
echo.
echo [INFO] 📱 Access Information:
echo [INFO]    Local Application: http://localhost:%PORT%
echo [INFO]    API Endpoint:      http://localhost:%PORT%/api/v1/
echo [INFO]    Admin Panel:       http://localhost:%PORT%/admin/
echo.
echo [INFO] 🔧 Useful Commands:
echo [INFO]    View logs: run_local.bat logs
echo [INFO]    Check status: run_local.bat status
echo [INFO]    Stop services: run_local.bat stop
echo [INFO]    Restart services: run_local.bat restart
echo.
echo [INFO] 📊 Admin Access:
echo [INFO]    Username: admin
echo [INFO]    Password: admin
echo.
echo [INFO] 📁 Log Files:
echo [INFO]    Main log: %LOG_FILE%
echo [INFO]    Django server: %SCRIPT_DIR%\logs\django_prod1.log
echo.
echo [INFO] 🌐 Cloudflare Tunnel:
echo [INFO]    Your Cloudflare tunnel should automatically detect localhost:%PORT%
echo [INFO]    Check your Cloudflare dashboard for the tunnel status
exit /b 0

:end
endlocal
