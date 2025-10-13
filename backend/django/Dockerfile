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

RUN mkdir -p /data/parquet
# Bake static_data into the image for production/demo use
COPY static_data/ /data/parquet/

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
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "philgeps_data_explorer.wsgi:application"]
