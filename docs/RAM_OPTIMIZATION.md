# RAM Disk Optimization for Parquet Data

This guide explains how to use the RAM disk (tmpfs) optimization for ultra-fast access to Parquet data files in the PhilGEPS Dashboard.

## Overview

The RAM disk optimization mounts the static Parquet data directory in RAM instead of disk storage, providing:
- **~10-100x faster read performance** compared to SSD/HDD
- **Zero disk I/O latency** for data access
- **Improved API response times** for data-heavy queries

## Requirements

### Memory Requirements
- **Minimum RAM**: 3 GB dedicated to tmpfs mount
- **Current data size**: ~1.8 GB (as of Nov 2024)
- **Recommended**: 4+ GB system RAM available beyond OS and application needs

### Trade-offs
- ✅ **Pros**: Ultra-fast data access, no disk I/O bottleneck
- ⚠️ **Cons**: Data is ephemeral (copied on container start), requires sufficient RAM

## Usage

### Quick Start

Use the pre-configured `docker-compose.ram.yml` file:

```bash
# Build and start with RAM optimization
docker compose -f docker-compose.ram.yml up --build

# Or in detached mode
docker compose -f docker-compose.ram.yml up -d --build
```

### Configuration Details

The RAM optimization is enabled via the `USE_TMPFS_PARQUET` environment variable:

```yaml
services:
  backend:
    environment:
      USE_TMPFS_PARQUET: "true"  # Enable RAM disk optimization
    tmpfs:
      - /data/parquet-tmpfs:size=3221225472,mode=1777  # 3GB RAM disk
```

## How It Works

1. **Build time**: Parquet files are baked into the Docker image at `/data/parquet-disk`
2. **Container start**: The `docker-entrypoint.sh` script checks `USE_TMPFS_PARQUET`
3. **If enabled**: Files are copied from `/data/parquet-disk` → `/data/parquet-tmpfs` (RAM)
4. **Runtime**: Django backend reads from `/data/parquet-tmpfs` (RAM) instead of disk

### Startup Sequence

```
Container Start
    ↓
Entrypoint Script
    ↓
Check USE_TMPFS_PARQUET=true
    ↓
Copy /data/parquet-disk/* → /data/parquet-tmpfs/ (RAM)
    ↓
Set PARQUET_DIR=/data/parquet-tmpfs
    ↓
Run Migrations & Collect Static
    ↓
Start Gunicorn
```

## Memory Sizing

Current tmpfs size is set to **3 GB** (3,221,225,472 bytes):

```yaml
tmpfs:
  - /data/parquet-tmpfs:size=3221225472,mode=1777
```

### Adjusting Size

If your data grows beyond 2.5 GB, increase the tmpfs size:

```yaml
# Example: 4 GB (4,294,967,296 bytes)
tmpfs:
  - /data/parquet-tmpfs:size=4294967296,mode=1777

# Example: 5 GB (5,368,709,120 bytes)
tmpfs:
  - /data/parquet-tmpfs:size=5368709120,mode=1777
```

## Monitoring

### Check RAM Usage

Inside the container:
```bash
docker exec philgeps-backend-ram df -h /data/parquet-tmpfs
```

### Verify Files in RAM

```bash
docker exec philgeps-backend-ram ls -lh /data/parquet-tmpfs
docker exec philgeps-backend-ram du -sh /data/parquet-tmpfs
```

### Container Logs

Watch the startup process to confirm RAM disk setup:
```bash
docker logs -f philgeps-backend-ram
```

Look for:
```
Copying parquet data to tmpfs RAM disk...
Files in RAM disk:
[file listing]
Parquet data loaded into RAM successfully!
```

## Disabling RAM Optimization

To disable and use disk-based storage:

1. **Option A**: Use the standard `docker-compose.yml` (no tmpfs)
2. **Option B**: Set `USE_TMPFS_PARQUET: "false"` in environment

## Performance Comparison

| Storage Type | Avg Read Latency | Throughput | Notes |
|--------------|------------------|------------|-------|
| HDD | 10-20ms | ~100-200 MB/s | Mechanical delay |
| SATA SSD | 0.1-1ms | ~500-600 MB/s | Good baseline |
| NVMe SSD | 0.02-0.1ms | ~3-7 GB/s | High-end |
| **RAM (tmpfs)** | **< 0.01ms** | **~20-50 GB/s** | **Fastest** |

## Best Practices

1. **Monitor RAM usage**: Ensure sufficient free RAM on host system
2. **Data validation**: Check that files are copied successfully on first run
3. **Backup strategy**: Always maintain source Parquet files on disk
4. **Growth planning**: Leave 50%+ headroom in tmpfs size for data growth
5. **Production use**: Consider container orchestration (K8s) for RAM allocation policies

## Troubleshooting

### Issue: Container fails to start with "out of memory" error
**Solution**: Increase Docker's memory limit or reduce tmpfs size

### Issue: Files not copied to tmpfs
**Solution**: Check `USE_TMPFS_PARQUET` is set to `"true"` (string, not boolean)

### Issue: PARQUET_DIR still pointing to disk
**Solution**: Verify entrypoint script is executable and being invoked

## Alternative Configurations

### For Development (Disk-Based)
Use `docker-compose.dev.yml` for live code reloading with volume mounts:
```bash
docker compose -f docker-compose.dev.yml up
```

### For Production (Standard)
Use `docker-compose.yml` for portable deployments without RAM requirements:
```bash
docker compose up -d
```

### For Production (RAM-Optimized)
Use `docker-compose.ram.yml` when performance is critical and RAM is available:
```bash
docker compose -f docker-compose.ram.yml up -d --build
```

---

**Created**: November 13, 2025  
**Data Size**: 1.8 GB (5.5M records)  
**RAM Allocation**: 3 GB tmpfs
