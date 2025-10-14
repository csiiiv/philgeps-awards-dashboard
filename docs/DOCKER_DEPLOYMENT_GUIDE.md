# Docker Deployment Guide

This guide explains how to containerize and deploy the PHILGEPS Awards Dashboard with separate images for backend (Django) and frontend (Vite React, served via Nginx). It complements the Production Deployment Guide and focuses on container best practices and cloud deployment tips.

## Images

- Backend: `backend/django/Dockerfile` — Python 3.11, Gunicorn, exposes 8000
- Frontend: `frontend/Dockerfile` — Multi-stage build, served via Nginx, exposes 80

## Local: Docker Compose

Compose file at the repo root provides local parity and quick start:

Services:
- backend: http://localhost:3200 (host) → 8000 (container)
- frontend: http://localhost:3000 (host) → 80 (container, Nginx)

Environment:
- Backend reads from `backend/django/.env` (use `env.example` as reference)
- Frontend uses build-time `VITE_API_URL` to point to backend

## Environment Variables

Backend (Django):
- SECRET_KEY (required)
- DEBUG (false in prod)
- ALLOWED_HOSTS (comma-separated)
- CORS_ALLOWED_ORIGINS (comma-separated, HTTPS URLs)
- SECURE_SSL_REDIRECT=true (behind HTTPS)
- DATABASE_URL or individual DB_* vars if using Postgres
- PARQUET_DIR (optional): directory of Parquet data. Defaults to repo-root/data/parquet during dev; in Docker we set it to `/data/parquet`.

Frontend (Vite):
- VITE_API_URL: Fully-qualified API base URL (e.g., https://api.example.com)
- Optional: VITE_BASE_URL for router base

Note: Vite env vars are injected at build-time. Build a different image per environment or use Nginx envsubst pattern at runtime if you need runtime-config.

## Build & Push

Backend (two options):
- Bake data into image (larger image, simpler runtime):
  - Build context at repo root so Dockerfile can COPY `data/parquet/`:
    - docker build -f backend/django/Dockerfile -t <registry>/philgeps-backend:TAG .
- Mount data at runtime (smaller image, faster deployments):
  - Keep image lean and use a volume `./data:/data`, set `PARQUET_DIR=/data/parquet`.
- Push: docker push <registry>/philgeps-backend:TAG

Frontend:
- Build: docker build --build-arg VITE_API_URL=https://api.example.com -t <registry>/philgeps-frontend:TAG frontend
- Push: docker push <registry>/philgeps-frontend:TAG

## Cloud Targets

Azure (Backend):
- Use Azure Container Apps, Web App for Containers, or AKS.
- Configure secrets in Azure (SECRET_KEY, DATABASE_URL, etc.).
- Enable health probe (`/api/v1/data-processing/health/`).
- Add Application Gateway/Front Door TLS; set `SECURE_SSL_REDIRECT=true`.
- Data options:
  - Bake into image (rebuild to refresh data), or
  - Mount cloud storage (Azure Files/Blob via CSI) at `/data` and set `PARQUET_DIR=/data/parquet`.
- If Postgres: Use Azure Database for PostgreSQL; set SSL mode as required (e.g., `?sslmode=require`).

AWS (Frontend):
- Options: Elastic Container Service (Fargate) or Elastic Beanstalk (Docker), or host static build on S3 + CloudFront (recommended and cheaper).
- If using ECS: run the Nginx-based image, map port 80 → ALB, enable HTTPS at the ALB/CloudFront.
- If using S3 + CloudFront: skip the container, upload `dist/`, configure SPA fallback to index.html, set API origin to backend domain.

## Networking & CORS

- Public URLs should be distinct: `https://app.example.com` (frontend) and `https://api.example.com` (backend).
- Configure CORS_ALLOWED_ORIGINS to include frontend origins.
- If using a reverse-proxy path-based routing (e.g., `/api`), you can set VITE_API_URL to `/api` and terminate CORS at the proxy instead.
- Probes:
  - Backend health: GET `/api/v1/data-processing/health/`
  - Data presence: GET `/api/v1/data-processing/available-time-ranges/` should report `all_time: true` if `/data/parquet` exists.

## TLS & Proxies

- Terminate TLS at a managed load balancer (Azure Front Door/App Gateway, AWS ALB/CloudFront).
- Pass `X-Forwarded-*` headers and trust proxies (Django SECURE_* settings already aligned).

## Logging & Monitoring

- Containers log to stdout/stderr — forward to cloud logs (Azure Log Analytics, AWS CloudWatch).
- Add health checks:
  - Backend: GET /api/schema/ (or create `/health/` view)
  - Frontend: GET `/` (200) or `/healthz` static file

## Scaling

- Backend: CPU-bound → multiple Gunicorn workers; memory-size accordingly.
- Frontend: stateless; scale via service count or CDN edge caching.

## Security Checklist

- DEBUG=false; unique SECRET_KEY
- Strong CORS and ALLOWED_HOSTS
- HTTPS everywhere; HSTS at the edge
- Secrets via cloud secret stores (Key Vault / Secrets Manager)
- Keep images minimal and updated

## Troubleshooting

- CORS errors → Verify origins and HTTPS.
- 502/504 → Check health probes, target ports (8000/80), security groups/firewalls.
- Wrong API URL in frontend → Ensure Vite build arg matches deployed backend URL.

---

For detailed non-container deployment steps, see `docs/PRODUCTION_DEPLOYMENT_GUIDE.md`.