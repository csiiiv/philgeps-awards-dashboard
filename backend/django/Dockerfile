FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app/

# Copy static parquet data into the image so the backend can serve data without a
# host volume. This makes the image larger but is useful for portable or CI
# builds. If you prefer a smaller image, mount `./backend/django/static_data`
# at runtime instead (see docker-compose.debug).
RUN mkdir -p /data/parquet && \
        if [ -d /app/static_data ]; then \
            cp -r /app/static_data/* /data/parquet/; \
        fi

# Make Parquet directory discoverable by the app
ENV PARQUET_DIR=/data/parquet

# Create directories for logs and media
RUN mkdir -p /app/logs /app/media

# Collect static files
RUN python manage.py collectstatic --noinput

# Run database migrations
RUN python manage.py migrate --noinput

# Expose port
EXPOSE 8000

# Run the application (ensure correct Django project module)
# Use gevent worker for optimal streaming/async I/O performance, with extended timeouts
ENV GUNICORN_TIMEOUT=${GUNICORN_TIMEOUT:-300}
ENV GUNICORN_GRACEFUL_TIMEOUT=${GUNICORN_GRACEFUL_TIMEOUT:-330}
ENV GUNICORN_KEEPALIVE=${GUNICORN_KEEPALIVE:-5}
ENV GUNICORN_LOG_LEVEL=${GUNICORN_LOG_LEVEL:-info}
ENV GUNICORN_ACCESS_LOG=${GUNICORN_ACCESS_LOG:--}
ENV GUNICORN_ERROR_LOG=${GUNICORN_ERROR_LOG:--}
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:8000 --timeout ${GUNICORN_TIMEOUT} --graceful-timeout ${GUNICORN_GRACEFUL_TIMEOUT} --keep-alive ${GUNICORN_KEEPALIVE} --log-level ${GUNICORN_LOG_LEVEL} --access-logfile ${GUNICORN_ACCESS_LOG} --error-logfile ${GUNICORN_ERROR_LOG} --workers 2 --worker-class gevent --worker-connections 1000 philgeps_data_explorer.wsgi:application"]
