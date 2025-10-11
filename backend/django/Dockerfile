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

# Install Python dependencies (copy from repo-root context)
COPY backend/django/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend project code
COPY backend/django/ /app/

# Copy Parquet data into the image (if present in repo under data/parquet)
# This keeps data out of STATIC and avoids exposing it via WhiteNoise.
RUN mkdir -p /data/parquet
COPY data/parquet/ /data/parquet/

# Make Parquet directory discoverable by the app
ENV PARQUET_DIR=/data/parquet

# Create directories for logs and media
RUN mkdir -p /app/logs /app/media

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run the application (ensure correct Django project module)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "philgeps_data_explorer.wsgi:application"]
