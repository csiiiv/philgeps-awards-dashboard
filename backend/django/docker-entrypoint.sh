#!/bin/bash
set -e

echo "=== PhilGEPS Backend Entrypoint ==="

# If using tmpfs for static_data, copy parquet files from baked-in location
if [ "$USE_TMPFS_PARQUET" = "true" ]; then
    echo "Copying parquet data to tmpfs RAM disk..."
    TMPFS_TARGET="/data/parquet-tmpfs"
    PARQUET_SOURCE="/data/parquet-disk"
    
    if [ -d "$PARQUET_SOURCE" ] && [ -d "$TMPFS_TARGET" ]; then
        echo "Source: $PARQUET_SOURCE"
        echo "Target: $TMPFS_TARGET"
        
        # Copy all parquet files to tmpfs
        cp -r "$PARQUET_SOURCE"/* "$TMPFS_TARGET/" 2>/dev/null || true
        
        # Update PARQUET_DIR to point to tmpfs location
        # Write to /etc/environment so it's available to all processes
        echo "PARQUET_DIR=$TMPFS_TARGET" >> /etc/environment
        export PARQUET_DIR="$TMPFS_TARGET"
        
        # Show what was copied
        echo "Files in RAM disk:"
        ls -lh "$TMPFS_TARGET"
        du -sh "$TMPFS_TARGET"
        echo "Parquet data loaded into RAM successfully!"
    else
        echo "WARNING: Source or target directory not found. Falling back to disk-based parquet."
        echo "PARQUET_DIR=${PARQUET_DIR:-/data/parquet}" >> /etc/environment
        export PARQUET_DIR="${PARQUET_DIR:-/data/parquet}"
    fi
else
    echo "Using disk-based parquet data (USE_TMPFS_PARQUET != true)"
    echo "PARQUET_DIR=${PARQUET_DIR:-/data/parquet}" >> /etc/environment
    export PARQUET_DIR="${PARQUET_DIR:-/data/parquet}"
fi

echo "PARQUET_DIR set to: $PARQUET_DIR"

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "=== Starting Gunicorn ==="
# Execute the main command (Gunicorn)
exec "$@"
