#!/usr/bin/env bash

set -euo pipefail

# Local Server Runner for : Unified Parquet Architecture (Ubuntu/Linux)
# Supports separate frontend and backend services for Cloudflare tunnel architecture
# Usage: ./run_local.sh [start|start-frontend|start-backend|stop|restart|status|logs|help] [options]
# Version: 3.0.0-linux

# --- Script Configuration ---
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROD_DIR="$SCRIPT_DIR"

# Load configuration from setup_env.sh or use defaults
load_config() {
  # Try to source the configuration from setup_env.sh
  if [[ -f "$SCRIPT_DIR/setup_env.sh" ]]; then
    # Extract configuration values from setup_env.sh (handle comments properly)
    BACKEND_PORT=$(grep '^BACKEND_PORT=' "$SCRIPT_DIR/setup_env.sh" | cut -d'=' -f2 | cut -d' ' -f1 | tr -d '"' || echo "3200")
    FRONTEND_PORT=$(grep '^FRONTEND_PORT=' "$SCRIPT_DIR/setup_env.sh" | cut -d'=' -f2 | cut -d' ' -f1 | tr -d '"' || echo "3000")
    DEV_API_DOMAIN=$(grep '^DEV_API_DOMAIN=' "$SCRIPT_DIR/setup_env.sh" | cut -d'=' -f2 | cut -d' ' -f1 | tr -d '"' || echo "philgeps-api.simple-systems.dev")
    DEV_FRONTEND_DOMAIN=$(grep '^DEV_FRONTEND_DOMAIN=' "$SCRIPT_DIR/setup_env.sh" | cut -d'=' -f2 | cut -d' ' -f1 | tr -d '"' | sed 's|https://||' || echo "philgeps.simple-systems.dev")
  else
    # Fallback to defaults
    BACKEND_PORT=3200
    FRONTEND_PORT=3000
    DEV_API_DOMAIN="philgeps-api.simple-systems.dev"
    DEV_FRONTEND_DOMAIN="philgeps.simple-systems.dev"
  fi
}

# Load configuration
load_config
LOGS_DIR="$SCRIPT_DIR/logs"
BACKEND_PID_FILE="$LOGS_DIR/backend.pid"
FRONTEND_PID_FILE="$LOGS_DIR/frontend.pid"
BACKEND_LOG="$LOGS_DIR/backend.log"
FRONTEND_LOG="$LOGS_DIR/frontend.log"
LOG_FILE="$LOGS_DIR/prod1_local_$(date +%Y%m%d_%H%M%S).log"

# Use a dedicated Linux virtual env directory by default to avoid Windows collisions.
# Can be overridden by exporting VENV_DIR before running this script.
VENV_DIR_DEFAULT="$PROD_DIR/venv-linux"
VENV_DIR="${VENV_DIR:-}"
if [[ -z "$VENV_DIR" ]]; then
  if [[ -x "$PROD_DIR/venv/bin/python" ]]; then
    # A valid Linux venv exists at ./venv; use it for backward compatibility.
    VENV_DIR="$PROD_DIR/venv"
  else
    VENV_DIR="$VENV_DIR_DEFAULT"
  fi
fi

mkdir -p "$LOGS_DIR"

# --- Logging Helpers ---
DEBUG_MODE=false

_timestamp() { date '+%Y-%m-%d %H:%M:%S'; }
_log() { local level="$1"; shift; local msg="$*"; local ts; ts=$(_timestamp); echo "[$ts] $level: $msg" | tee -a "$LOG_FILE"; }
log_info() { _log "INFO" "$*"; }
log_warn() { _log "WARN" "$*"; }
log_error() { _log "ERROR" "$*"; }
log_success() { _log "SUCCESS" "$*"; }
log_debug() { $DEBUG_MODE && _log "DEBUG" "$*" || true; }

# --- Arg Parsing ---
COMMAND="start"

SKIP_BUILD=false
SKIP_MIGRATE=false
RUN_ONLY=false
FORCE=false
FORCE_NPM_INSTALL=false

show_help() {
  cat <<EOF
Local Server Runner for Production 1: Unified Parquet Architecture (Linux) - v3.0.0

Usage: ./run_local.sh [COMMAND] [OPTIONS]

Commands:
  start            Setup venv, migrate, and start both services (default)
  start-frontend   Start only the React development server (port $FRONTEND_PORT)
  start-backend    Start only the Django backend server (port $BACKEND_PORT)
  stop             Stop all running services
  restart          Stop, then start all services
  status           Show service status and health
  logs             Tail the service logs
  config           Show loaded configuration from setup_env.sh
  help             Show this help

Options:
  --skip-build     Skip frontend build
  --skip-migrate   Skip Django migrations
  --run-only       Shortcut for --skip-build and --skip-migrate
  --force          Kill any process using ports before start
  --debug          Enable verbose debug output

Architecture:
  Frontend: http://localhost:$FRONTEND_PORT (Vite dev server)
  Backend:  http://localhost:$BACKEND_PORT (Django + serves built frontend)
  
  Cloudflare Tunnels:
  - https://$DEV_FRONTEND_DOMAIN/ → localhost:$FRONTEND_PORT
  - https://$DEV_API_DOMAIN/ → localhost:$BACKEND_PORT

Env:
  VENV_DIR         Path to Python virtualenv to use (default: $VENV_DIR_DEFAULT)
EOF
}

if [[ $# -gt 0 ]]; then
  COMMAND="$1"; shift || true
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build) SKIP_BUILD=true; shift;;
    --skip-migrate) SKIP_MIGRATE=true; shift;;
    --run-only) RUN_ONLY=true; SKIP_BUILD=true; SKIP_MIGRATE=true; shift;;
    --force) FORCE=true; shift;;
    --force-npm-install) FORCE_NPM_INSTALL=true; shift;;
    --debug) DEBUG_MODE=true; shift;;
    -h|--help) COMMAND="help"; shift;;
    *) log_error "Unknown option: $1"; show_help; exit 1;;
  esac
done

# --- Environment and Path Checks ---
require_cmd() { command -v "$1" >/dev/null 2>&1 || { log_error "'$1' not found in PATH"; exit 1; }; }

test_environment() {
  log_info "Checking environment setup..."
  local backend_path="$PROD_DIR/backend"
  local frontend_path="$PROD_DIR/frontend"

  log_debug "Script directory: $SCRIPT_DIR"
  log_debug "Project directory: $PROD_DIR"
  log_debug "Current working directory: $(pwd)"
  log_debug "Backend path: $backend_path (exists: $( [[ -d "$backend_path" ]] && echo yes || echo no ))"
  log_debug "Frontend path: $frontend_path (exists: $( [[ -d "$frontend_path" ]] && echo yes || echo no ))"

  if [[ ! -d "$backend_path" || ! -d "$frontend_path" ]]; then
    log_error "Project structure is incorrect. Expected 'backend' and 'frontend' in '$PROD_DIR'."
    exit 1
  fi

  require_cmd python3
  require_cmd pip3
  require_cmd node
  require_cmd npm

  log_success "Environment check passed."
}

# --- Core Functions ---
build_frontend() {
  if $SKIP_BUILD; then
    log_info "Skipping frontend build as requested."
    return 0
  fi
  log_info "Building React frontend..."
  pushd "$PROD_DIR/frontend" >/dev/null
  if [[ ! -d node_modules || $FORCE_NPM_INSTALL == true ]]; then
    if $FORCE_NPM_INSTALL; then
      log_info "--force-npm-install specified: running 'npm install' regardless of node_modules presence..."
    else
      log_info "Installing frontend dependencies with 'npm install'..."
    fi
    npm install
  else
    log_info "Frontend dependencies already installed."
  fi
  log_info "Building frontend with 'npm run build'..."
  npm run build
  if [[ ! -f "dist/index.html" ]]; then
    log_error "Frontend build failed: 'dist/index.html' not found after build."
    popd >/dev/null
    exit 1
  fi
  popd >/dev/null
  log_success "Frontend build completed successfully."
}

setup_python_environment() {
  log_info "Setting up Python environment..."
  local backend_dir="$PROD_DIR/backend/django"
  local venv_dir="$VENV_DIR"

  log_debug "Backend directory: $backend_dir (exists: $( [[ -d "$backend_dir" ]] && echo yes || echo no ))"
  log_debug "Virtual environment directory: $venv_dir (exists: $( [[ -d "$venv_dir" ]] && echo yes || echo no ))"

  pushd "$backend_dir" >/dev/null

  if [[ ! -d "$venv_dir" ]]; then
    log_info "Creating Python virtual environment at '$venv_dir'..."
    python3 -m venv "$venv_dir"
  fi

  local python_venv="$venv_dir/bin/python"
  local pip_venv="$venv_dir/bin/pip"

  if [[ ! -x "$python_venv" || ! -x "$pip_venv" ]]; then
    log_error "Virtual environment is corrupted or was not created successfully."
    log_error "Missing executables at '$python_venv' or '$pip_venv'."
    exit 1
  fi

  if [[ -f requirements.txt ]]; then
    log_info "Installing Python dependencies from requirements.txt..."
    "$pip_venv" install -r requirements.txt
  else
    log_warn "'requirements.txt' not found. Installing essential dependencies..."
    "$pip_venv" install django djangorestframework django-cors-headers django-filter whitenoise gunicorn duckdb pandas
  fi

  popd >/dev/null
  log_success "Python environment setup complete."
}

setup_django_environment() {
  log_info "Setting up Django environment..."
  local backend_dir="$PROD_DIR/backend/django"
  local python_venv="$VENV_DIR/bin/python"

  pushd "$backend_dir" >/dev/null

  if ! $SKIP_MIGRATE; then
    log_info "Running Django migrations..."
    "$python_venv" manage.py migrate
  else
    log_info "Skipping Django migrations as requested."
  fi

  log_info "Collecting static files..."
  "$python_venv" manage.py collectstatic --noinput

  log_info "Checking for admin superuser..."
  set +e
  "$python_venv" manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); exit(0) if User.objects.filter(username='admin').exists() else exit(1)"
  local has_admin=$?
  set -e
  if [[ $has_admin -ne 0 ]]; then
    log_info "Creating superuser 'admin' with password 'admin'..."
    echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin')" | "$python_venv" manage.py shell
  else
    log_info "Superuser 'admin' already exists."
  fi

  popd >/dev/null
  log_success "Django environment setup complete."
}

test_port_conflict() {
  local port=$1
  local service_name=$2
  log_info "Checking for process on port $port..."
  local pids
  if command -v lsof >/dev/null 2>&1; then
    pids=$(lsof -t -i :"$port" || true)
  else
    # Fallback to ss
    pids=$(ss -ltnp 2>/dev/null | awk -v p=":$port" '$4 ~ p {print $6}' | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | sort -u || true)
  fi

  if [[ -n "${pids:-}" ]]; then
    log_warn "Port $port is in use by PIDs: $pids"
    if $FORCE; then
      log_info "'--force' specified: terminating processes..."
      # shellcheck disable=SC2086
      kill -9 $pids || true
      sleep 1
      log_success "Processes terminated."
    else
      log_error "Port conflict detected for $service_name. Stop the process manually or use '--force'."
      return 1
    fi
  else
    log_success "Port $port is free for $service_name."
  fi
}

start_backend_server() {
  log_info "Starting Django backend server..."
  test_environment
  test_port_conflict $BACKEND_PORT "backend" || exit 1

  local backend_dir="$PROD_DIR/backend/django"
  local python_venv="$VENV_DIR/bin/python"

  if [[ ! -x "$python_venv" ]]; then
    log_error "Python virtual environment not found at '$python_venv'. Please run setup first."
    return 1
  fi
  if [[ ! -f "$backend_dir/manage.py" ]]; then
    log_error "manage.py not found in '$backend_dir'."
    return 1
  fi

  mkdir -p "$LOGS_DIR"
  : > "$BACKEND_LOG"

  pushd "$backend_dir" >/dev/null
  nohup "$python_venv" manage.py runserver 0.0.0.0:"$BACKEND_PORT" >> "$BACKEND_LOG" 2>&1 &
  local backend_pid=$!
  echo "$backend_pid" > "$BACKEND_PID_FILE"
  popd >/dev/null

  sleep 2
  if ps -p "$backend_pid" >/dev/null 2>&1; then
    log_success "Django backend server is running (PID: $backend_pid)."
    log_info "Backend should be available at http://localhost:$BACKEND_PORT"
    return 0
  else
    log_error "Django backend server failed to start. Check logs: $BACKEND_LOG"
    return 1
  fi
}

start_frontend_server() {
  log_info "Starting React frontend development server..."
  test_environment
  test_port_conflict $FRONTEND_PORT "frontend" || exit 1

  local frontend_dir="$PROD_DIR/frontend"
  pushd "$frontend_dir" >/dev/null
  if [[ ! -d node_modules || $FORCE_NPM_INSTALL == true ]]; then
    if $FORCE_NPM_INSTALL; then
      log_info "--force-npm-install specified: running 'npm install' regardless of node_modules presence..."
    else
      log_info "Installing frontend dependencies with 'npm install'..."
    fi
    npm install
  fi

  mkdir -p "$LOGS_DIR"
  : > "$FRONTEND_LOG"

  nohup npm run dev >> "$FRONTEND_LOG" 2>&1 &
  local frontend_pid=$!
  echo "$frontend_pid" > "$FRONTEND_PID_FILE"
  popd >/dev/null

  sleep 3
  if ps -p "$frontend_pid" >/dev/null 2>&1; then
    log_success "React frontend server is running (PID: $frontend_pid)."
    log_info "Frontend should be available at http://localhost:$FRONTEND_PORT"
    return 0
  else
    log_error "React frontend server failed to start. Check logs: $FRONTEND_LOG"
    return 1
  fi
}

stop_services() {
  log_info "Stopping all services..."
  
  # Stop backend
  if [[ -f "$BACKEND_PID_FILE" ]]; then
    local pid
    pid="$(cat "$BACKEND_PID_FILE" || true)"
    if [[ -n "$pid" && -e "/proc/$pid" ]]; then
      log_info "Stopping Django backend server (PID: $pid)..."
      kill "$pid" 2>/dev/null || true
      sleep 1
      kill -9 "$pid" 2>/dev/null || true
      log_success "Django backend server stopped."
    else
      log_warn "Stale backend PID file found; removing."
    fi
    rm -f "$BACKEND_PID_FILE"
  else
    log_info "No backend PID file found."
  fi

  # Stop frontend
  if [[ -f "$FRONTEND_PID_FILE" ]]; then
    local pid
    pid="$(cat "$FRONTEND_PID_FILE" || true)"
    if [[ -n "$pid" && -e "/proc/$pid" ]]; then
      log_info "Stopping React frontend server (PID: $pid)..."
      kill "$pid" 2>/dev/null || true
      sleep 1
      kill -9 "$pid" 2>/dev/null || true
      log_success "React frontend server stopped."
    else
      log_warn "Stale frontend PID file found; removing."
    fi
    rm -f "$FRONTEND_PID_FILE"
  else
    log_info "No frontend PID file found."
  fi

  log_success "Stop command finished."
}

show_status() {
  log_info "Checking service status..."

  log_info "Django Backend Server:"
  if [[ -f "$BACKEND_PID_FILE" ]]; then
    local pid
    pid="$(cat "$BACKEND_PID_FILE" || true)"
    if [[ -n "$pid" && -e "/proc/$pid" ]]; then
      log_success "Django backend server is RUNNING (PID: $pid)."
      if curl -fsS "http://localhost:$BACKEND_PORT/" >/dev/null; then
        log_success "Django backend server is responding at http://localhost:$BACKEND_PORT/"
      else
        log_warn "Django backend server process is running, but NOT RESPONDING."
      fi
    else
      log_error "Django backend server is STOPPED. Removing stale PID file."
      rm -f "$BACKEND_PID_FILE"
    fi
  else
    log_info "Django backend server is STOPPED (no PID file found)."
  fi

  log_info "React Frontend Server:"
  if [[ -f "$FRONTEND_PID_FILE" ]]; then
    local pid
    pid="$(cat "$FRONTEND_PID_FILE" || true)"
    if [[ -n "$pid" && -e "/proc/$pid" ]]; then
      log_success "React frontend server is RUNNING (PID: $pid)."
      if curl -fsS "http://localhost:$FRONTEND_PORT/" >/dev/null; then
        log_success "React frontend server is responding at http://localhost:$FRONTEND_PORT/"
      else
        log_warn "React frontend server is running, but NOT RESPONDING."
      fi
    else
      log_error "React frontend server is STOPPED. Removing stale PID file."
      rm -f "$FRONTEND_PID_FILE"
    fi
  else
    log_info "React frontend server is STOPPED (no PID file found)."
  fi
}

show_logs() {
  log_info "Available log files:"
  log_info "  Backend:  $BACKEND_LOG"
  log_info "  Frontend: $FRONTEND_LOG"
  log_info "  Main:     $LOG_FILE"
  echo ""
  log_info "Showing backend logs. Press Ctrl+C to exit."
  if [[ -f "$BACKEND_LOG" ]]; then
    tail -n 10 -f "$BACKEND_LOG"
  else
    log_warn "Backend log file not found at '$BACKEND_LOG'."
  fi
}

show_access_info() {
  echo "" | tee -a "$LOG_FILE"
  log_success "Production 1 is now running with separate services!"
  echo "" | tee -a "$LOG_FILE"
  log_info "Access Information:"
  _log "" "   - Frontend (Dev):     http://localhost:$FRONTEND_PORT" >/dev/null || true
  _log "" "   - Backend (API):      http://localhost:$BACKEND_PORT" >/dev/null || true
  _log "" "   - API Endpoint:       http://localhost:$BACKEND_PORT/api/v1/" >/dev/null || true
  _log "" "   - Admin Panel:        http://localhost:$BACKEND_PORT/admin/ (user: admin, pass: admin)" >/dev/null || true
  echo "" | tee -a "$LOG_FILE"
  log_info "Cloudflare Tunnel Setup:"
  _log "" "   - Frontend Tunnel:    https://$DEV_FRONTEND_DOMAIN/ → localhost:$FRONTEND_PORT" >/dev/null || true
  _log "" "   - Backend Tunnel:     https://$DEV_API_DOMAIN/ → localhost:$BACKEND_PORT" >/dev/null || true
  echo "" | tee -a "$LOG_FILE"
  log_info "Log Files:"
  _log "" "   - Backend Log:        $BACKEND_LOG" >/dev/null || true
  _log "" "   - Frontend Log:       $FRONTEND_LOG" >/dev/null || true
  _log "" "   - Main Log:           $LOG_FILE" >/dev/null || true
}

# --- Main Operations ---
start_all_services() {
  log_info "Executing 'start' command..."
  test_environment
  # User rule: always run venv first
  setup_python_environment
  # Build frontend BEFORE collectstatic so latest assets are collected
  build_frontend
  setup_django_environment
  
  # Start backend first
  if start_backend_server; then
    log_success "Backend started successfully."
  else
    log_error "Failed to start backend. Please check the logs."
    exit 1
  fi
  
  # Start frontend
  if start_frontend_server; then
    log_success "Frontend started successfully."
    show_access_info
  else
    log_error "Failed to start frontend. Please check the logs."
    exit 1
  fi
}

case "$COMMAND" in
  start)
    # If run-only, ensure flags propagate
    if $RUN_ONLY; then log_info "Mode: RUN-ONLY (skipping build and migrations)."; fi
    $SKIP_BUILD && log_info "Mode: Skipping frontend build." || true
    $SKIP_MIGRATE && log_info "Mode: Skipping Django migrations." || true
    start_all_services
    ;;
  start-backend)
    $RUN_ONLY && log_info "Mode: RUN-ONLY (skipping migrations)." || true
    test_environment
    setup_python_environment
    build_frontend
    setup_django_environment
    start_backend_server
    ;;
  start-frontend)
    test_environment
    start_frontend_server
    ;;
  stop)
    stop_services
    ;;
  restart)
    stop_services
    sleep 1
    start_all_services
    ;;
  status)
    show_status
    ;;
  logs)
    show_logs
    ;;
  config)
    log_info "Configuration loaded from setup_env.sh:"
    log_info "  Backend Port: $BACKEND_PORT"
    log_info "  Frontend Port: $FRONTEND_PORT"
    log_info "  API Domain: $DEV_API_DOMAIN"
    log_info "  Frontend Domain: $DEV_FRONTEND_DOMAIN"
    log_info "  Virtual Environment: $VENV_DIR"
    log_info "  Python Path: $VENV_DIR/bin/python"
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    log_error "Unknown command: '$COMMAND'"
    show_help
    exit 1
    ;;
esac