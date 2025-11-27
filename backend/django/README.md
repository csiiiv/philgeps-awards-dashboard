# Django Application

Main Django project containing the PHILGEPS Awards Data Explorer backend API with data processing, analytics, and management capabilities.

## 📁 Directory Structure

### Core Django Apps

#### `/contracts/` - Contract Data Management
Django app for managing contract data, search functionality, and API endpoints.

**Files:**
- **`models.py`** - Django models for contract data structure
- **`views.py`** - API views and viewset definitions
- **`serializers.py`** - DRF serializers for API data transformation
- **`urls.py`** - URL routing for contract endpoints
- **`admin.py`** - Django admin configuration
- **`filters.py`** - API filtering and search functionality
- **`parquet_search.py`** - Basic Parquet file search implementation
- **`parquet_search_optimized.py`** - Optimized Parquet search with performance improvements
- **`parquet_search_fast.py`** - Fast Parquet search implementation
- **`tests.py`** - Unit tests for contract functionality
- **`apps.py`** - Django app configuration
- **`/migrations/`** - Database migration files

#### `/data_processing/` - Data Processing Services
Django app for data processing, analytics, and utility services.

**Files:**
- **`models.py`** - Data processing models
- **`views.py`** - Data processing API views
- **`urls.py`** - URL routing for data processing endpoints
- **`parquet_service.py`** - Parquet file processing service
- **`admin.py`** - Django admin configuration
- **`apps.py`** - Django app configuration
- **`tests.py`** - Unit tests for data processing
- **`/migrations/`** - Database migration files
- **`/management/`** - Django management commands

#### `/philgeps_data_explorer/` - Main Project Configuration
Main Django project settings and configuration.

**Files:**
- **`settings.py`** - Django settings configuration
- **`urls.py`** - Main URL routing configuration
- **`wsgi.py`** - WSGI application entry point
- **`asgi.py`** - ASGI application entry point
- **`views.py`** - Main project views
- **`__init__.py`** - Python package initialization

### Configuration Files

#### Core Files
- **`manage.py`** - Django management script for running commands
- **`requirements.txt`** - Python package dependencies
- **`Dockerfile`** - Docker container configuration
- **`db.sqlite3`** - SQLite database file (development)

#### Environment Configuration
- **`env.example`** - Environment variables example file
- **`env.template`** - Environment configuration template

### Data and Static Files

#### `/data/` - Data Storage
- **`/parquet/`** - Parquet data files for fast analytics

Data path configuration:
- Default: repo-root `data/parquet` during local dev.
- Docker: set `PARQUET_DIR=/data/parquet` and either bake data into the image (Dockerfile copies `data/parquet/`) or mount at runtime with a volume `./data:/data`.
- Never place Parquet files under `static/` — they would be publicly served by WhiteNoise and bloat the static manifest.

#### `/staticfiles/` - Static Files
- **`/admin/`** - Django admin static files
- **`/rest_framework/`** - Django REST Framework static files
- **`/assets/`** - Application static assets

#### `/logs/` - Application Logs
- **`django.log`** - Django application logs

## 🚀 Development Setup

### Prerequisites
- Python 3.9+
- pip package manager
- Virtual environment

### Installation
```bash
# Create virtual environment
python -m venv venv-linux
source venv-linux/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver 0.0.0.0:3200
```

## 🔧 API Endpoints

### Contract Endpoints
- **`/api/v1/contracts/`** - Contract data CRUD operations
- **`/api/v1/contracts/chip-search/`** - Advanced search functionality
- **`/api/v1/contracts/chip-aggregates/`** - Analytics data aggregation
- **`/api/v1/contracts/chip-aggregates-paginated/`** - Paginated analytics
- **`/api/v1/contracts/chip-export/`** - Individual contracts CSV export
- **`/api/v1/contracts/chip-export-aggregated/`** - Aggregated data CSV export
- **`/api/v1/contracts/filter-options/`** - Filter options
- **`/api/v1/contracts/health/`** - Health check endpoint
- **`/api/v1/contracts/stats/`** - Application statistics

### API Documentation
- **`/api/docs/`** - Swagger UI interactive documentation
- **`/api/redoc/`** - ReDoc API documentation
- **`/api/schema/`** - OpenAPI 3.0 schema

### Admin Interface
- **`/admin/`** - Django admin interface for data management

## 📊 Key Features

### Data Processing
- **Parquet Integration** - Efficient columnar data processing
- **DuckDB Analytics** - Fast in-memory analytics
- **Search Optimization** - Optimized search algorithms
- **Data Aggregation** - Pre-computed aggregations for performance
- **Background Tasks** - Celery-based asynchronous task processing for heavy operations

### API Features
- **RESTful API** - Standard REST API endpoints
- **OpenAPI 3.0** - Complete API documentation with drf-spectacular
- **Filtering & Search** - Advanced filtering and search capabilities
- **Pagination** - Efficient pagination for large datasets
- **Serialization** - JSON serialization with DRF
- **Export APIs** - Individual contracts and aggregated data export
- **CORS Support** - Cross-origin resource sharing configuration

### Admin Features
- **Data Management** - Admin interface for data management
- **User Management** - User and permission management
- **Logging** - Application logging and monitoring

## 🛠️ Configuration

### Settings Configuration
The `settings.py` file contains:
- Database configuration
- Static files configuration
- CORS settings
- Logging configuration
- Security settings
- API configuration

### Environment Variables
- **`DEBUG`** - Debug mode setting
- **`SECRET_KEY`** - Django secret key
- **`ALLOWED_HOSTS`** - Allowed host names
- **`CORS_ALLOWED_ORIGINS`** - CORS configuration
- **`DATABASE_URL`** - Database connection string

## 📝 Development Guidelines

### Code Organization
- Follow Django best practices
- Use proper model relationships
- Implement proper error handling
- Write comprehensive tests
- Document API endpoints

### Performance Considerations
- Use database indexing
- Implement query optimization
- Use caching where appropriate
- Monitor performance metrics

### Security
- Implement proper authentication
- Use CSRF protection
- Validate input data
- Follow security best practices

## 🔄 Background Task Processing with Celery

This application uses **Celery** with **RabbitMQ** as the message broker and **Redis** as the result backend for asynchronous task processing.

### Architecture
- **RabbitMQ** - Message broker (AMQP protocol) on port 5672
- **Redis** - Result backend and caching on port 6379
- **Celery Worker** - Background task processor
- **Flower** - Celery monitoring dashboard on port 5555

### Available Tasks

#### 1. `export_contracts_to_excel`
Exports large datasets to Excel files based on filter criteria.
```python
from data_processing.tasks import export_contracts_to_excel

result = export_contracts_to_excel.delay(
    filters={
        'contractors': ['Company A', 'Company B'],
        'areas': ['Metro Manila'],
        'keywords': ['infrastructure'],
        'time_ranges': [{'start': '2023-01-01', 'end': '2023-12-31'}]
    },
    export_id='unique-export-id'
)
```

#### 2. `compute_heavy_aggregates`
Computes analytics aggregates in the background for large datasets.
```python
from data_processing.tasks import compute_heavy_aggregates

result = compute_heavy_aggregates.delay(
    filters={'contractors': ['Company A']},
    cache_key='aggregates:company-a'
)
```

#### 3. `process_full_table_search`
Processes full-table search operations asynchronously.
```python
from data_processing.tasks import process_full_table_search

result = process_full_table_search.delay(
    search_params={
        'keywords': ['infrastructure'],
        'page': 1,
        'page_size': 100
    },
    result_key='search:infrastructure'
)
```

#### 4. `cleanup_old_exports`
Periodic task to clean up export files older than 24 hours.
```python
from data_processing.tasks import cleanup_old_exports

# Can be called manually or scheduled via Celery Beat
result = cleanup_old_exports.delay()
```

### Running Celery

#### Using Docker Compose
Celery services are automatically started with docker-compose:
```bash
# Start all services including Celery worker
docker compose -f docker-compose.ram.yml up -d

# View Celery worker logs
docker logs philgeps-celeryworker -f

# Restart Celery worker
docker compose -f docker-compose.ram.yml restart celeryworker
```

#### Manual Development Mode
```bash
# Start Celery worker
celery -A philgeps_data_explorer worker --loglevel=info

# Start Celery Beat (for periodic tasks)
celery -A philgeps_data_explorer beat --loglevel=info

# Start Flower monitoring
celery -A philgeps_data_explorer flower --port=5555
```

### Monitoring with Flower

Access the Flower monitoring dashboard at `http://localhost:5555` to:
- View active, queued, and completed tasks
- Monitor worker status and performance
- Inspect task results and errors
- Cancel or retry failed tasks

### Task States and Error Handling

Tasks can have the following states:
- **PENDING** - Task is waiting to be executed
- **STARTED** - Task has started execution
- **PROGRESS** - Task is in progress (custom state)
- **SUCCESS** - Task completed successfully
- **FAILURE** - Task failed with error
- **RETRY** - Task is being retried after failure

Example of checking task status:
```python
from celery.result import AsyncResult

# Get task result
task = AsyncResult('task-id')
print(f"Status: {task.state}")
print(f"Result: {task.result}")

# Wait for result with timeout
try:
    result = task.get(timeout=30)
except TimeoutError:
    print("Task timed out")
```

### Configuration

Celery settings are configured in `settings.py`:
```python
# Celery Configuration
CELERY_BROKER_URL = 'amqp://guest:guest@rabbitmq:5672//'
result_backend = 'redis://redis:6379/0'
accept_content = ['json']
task_serializer = 'json'
result_serializer = 'json'
timezone = 'Asia/Manila'
```

Environment variables:
- `CELERY_BROKER_URL` - RabbitMQ connection URL
- `CELERY_RESULT_BACKEND` - Redis connection URL for results
- `REDIS_URL` - Redis connection URL for caching

### Best Practices

1. **Idempotency** - Design tasks to be safely retried
2. **Timeouts** - Set appropriate timeouts for long-running tasks
3. **Error Handling** - Implement proper error handling and logging
4. **Task Chunking** - Break large tasks into smaller chunks
5. **Result Expiration** - Set appropriate TTL for task results
6. **Monitoring** - Regularly monitor Celery worker health and queue size

### Troubleshooting

#### Worker not connecting to RabbitMQ
```bash
# Check RabbitMQ status
docker exec philgeps-rabbitmq rabbitmqctl status

# Check network connectivity
docker exec philgeps-celeryworker ping rabbitmq
```

#### Tasks stuck in PENDING state
- Ensure Celery worker is running and connected
- Check RabbitMQ queues: http://localhost:15672 (guest/guest)
- Verify task is properly registered in worker logs

#### Out of memory errors
- Adjust worker concurrency: `--concurrency=4`
- Reduce `memory_limit` in DuckDB queries
- Process data in smaller batches

### RabbitMQ Management

Access RabbitMQ Management UI at `http://localhost:15672`:
- **Username:** guest
- **Password:** guest

Use it to:
- Monitor queues and message rates
- View connections and channels
- Manage exchanges and bindings
- Purge queues if needed
