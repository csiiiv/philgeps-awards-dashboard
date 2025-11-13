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

# Copy static parquet data into the image at a staging location
# The entrypoint script will optionally copy this to tmpfs (RAM disk) for faster access
RUN mkdir -p /data/parquet-disk && \
        if [ -d /app/static_data ]; then \
            cp -r /app/static_data/* /data/parquet-disk/; \
        fi

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create directories for logs and media
RUN mkdir -p /app/logs /app/media

# Expose port
EXPOSE 8000

# Set Gunicorn environment defaults
ENV GUNICORN_TIMEOUT=${GUNICORN_TIMEOUT:-300}
ENV GUNICORN_GRACEFUL_TIMEOUT=${GUNICORN_GRACEFUL_TIMEOUT:-330}
ENV GUNICORN_KEEPALIVE=${GUNICORN_KEEPALIVE:-5}
ENV GUNICORN_LOG_LEVEL=${GUNICORN_LOG_LEVEL:-info}
ENV GUNICORN_ACCESS_LOG=${GUNICORN_ACCESS_LOG:--}
ENV GUNICORN_ERROR_LOG=${GUNICORN_ERROR_LOG:--}

# Use entrypoint to handle tmpfs copy and migrations
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Default command: run Gunicorn with gevent workers
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:8000 --timeout ${GUNICORN_TIMEOUT} --graceful-timeout ${GUNICORN_GRACEFUL_TIMEOUT} --keep-alive ${GUNICORN_KEEPALIVE} --log-level ${GUNICORN_LOG_LEVEL} --access-logfile ${GUNICORN_ACCESS_LOG} --error-logfile ${GUNICORN_ERROR_LOG} --workers 2 --worker-class gevent --worker-connections 1000 philgeps_data_explorer.wsgi:application"]
