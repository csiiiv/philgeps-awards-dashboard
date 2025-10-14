# Recommendations for Cleanup & Improvements (v3.3.0)

This document lists prioritized, actionable recommendations for codebase, docs, and DevOps. Each item includes rationale, expected impact, and suggested owner.

## Priorities at a Glance
- P0 – Must do next sprint: security, correctness, developer productivity
- P1 – High value: performance, DX, reliability
- P2 – Nice-to-have: polish, docs depth

---

## Backend (Django + DRF)

1) Bump API version strings to 1.1.0 (P0)
- What: Update `SPECTACULAR_SETTINGS['VERSION']` and `api_info()` in `urls.py` from 1.0.0 → 1.1.0 to match docs.
- Files:
  - `backend/django/philgeps_data_explorer/settings.py`
  - `backend/django/philgeps_data_explorer/urls.py`
  - `backend/django/openapi-schema.yaml`
- Impact: Consistency between live API and docs; avoids confusion.
- Owner: Backend

2) Tighten DEBUG and ALLOWED_HOSTS defaults (P0)
- What: Keep `DEBUG=False` default; don’t wildcard ALLOWED_HOSTS when DEBUG true in containers.
- Change idea: Only set `ALLOWED_HOSTS=['*']` for local manage.py run; add env guard.
- Impact: Better prod-safety and parity in dev images.
- Owner: Backend

3) Enable basic CORS/CSRF env validation (P1)
- What: On startup, log warnings if `CORS_ALLOWED_ORIGINS`/`CSRF_TRUSTED_ORIGINS` envs are empty in non-DEBUG mode.
- Impact: Prevent misconfigured deployments.
- Owner: Backend

4) Add minimal unit tests (P1)
- What: Add tests for: health endpoint, `chip-search` happy path, `chip-aggregates` dimensions, `query_entities` basic paging.
- Impact: Regression safety; CI baseline.
- Owner: Backend

5) Revisit Celery/Redis (P2)
- What: Requirements include celery/redis but no task usage detected. Either wire tasks or move to optional extras.
- Impact: Smaller images, fewer deps if unused.
- Owner: Backend

6) Rate-limit headers (P2)
- What: Optionally expose rate-limit headers on responses to match docs example.
- Impact: Better client UX; traceability.
- Owner: Backend

---

## Frontend (React + Vite)

1) Remove Date.now() filename hashing (P0)
- What: `vite.config.ts` uses `Date.now()` for asset file names; breaks caching and reproducibility.
- Change: Use `[hash]` placeholders instead.
- Impact: Deterministic builds with long-term caching.
- Owner: Frontend

2) Silence dev-only console logs (P1)
- What: `UnifiedExportTester.tsx`, `serviceWorker.ts`, `filterPersistence.ts` log verbosely.
- Change: Guard with `if (import.meta.env.DEV)` or use a tiny logger.
- Impact: Cleaner console; avoids leaking in prod.
- Owner: Frontend

3) Align README tech versions (P1)
- What: Frontend README still claims React 18; package.json is React 19.
- Impact: Doc accuracy.
- Owner: Frontend/Docs

4) E2E smoke with Playwright (P1)
- What: Add a basic route load test (home page renders, API docs page renders).
- Impact: Confidence on deploys.
- Owner: Frontend

5) Tree-shake checks (P2)
- What: Ensure chart libs (Chart.js, Recharts, d3) are imported in a tree-shake-friendly way; audit bundle size.
- Impact: Smaller bundle.
- Owner: Frontend

---

## DevOps & Tooling

1) Production compose defaults (P0)
- What: `docker-compose.yml` sets `DEBUG=True`. Create `.dev` (keep) and make default `docker-compose.yml` production-lean (DEBUG False, healthchecks).
- Impact: Safer defaults; fewer footguns.
- Owner: DevOps

2) Add healthchecks (P0)
- What: Add container-level healthchecks: backend GET `/api/v1/data-processing/health/`, frontend TCP 80.
- Impact: Orchestrator restarts unhealthy services.
- Owner: DevOps

3) CI: Lint + typecheck + tests (P0)
- What: Add GitHub Actions workflow: backend `black --check`, `flake8`, `pytest -q`; frontend `eslint`, `tsc -noEmit`, `jest -w=1`.
- Impact: Prevent regressions; enforce quality gates.
- Owner: DevOps

4) Pin Node/Python versions (P1)
- What: Specify Node 18.x in frontend engines; keep Python 3.11 in backend; reflect in docs.
- Impact: Reproducible builds.
- Owner: DevOps

5) Pre-commit hooks (P2)
- What: Setup `pre-commit` with black, isort, flake8, prettier, eslint.
- Impact: Faster feedback locally.
- Owner: DevOps

---

## Data & Scripts

1) Scripts README drift (P0)
- What: `scripts/README.md` states Last Updated Oct 7, 2025 v3.1.0; update to v3.3.0 and current steps.
- Impact: Avoid confusion.
- Owner: Data/Docs

2) Promote unified generator path (P1)
- What: Ensure `scripts/core/generate_unified_parquet_data.py` is the single source of truth and referenced by README and docs.
- Impact: Simpler pipeline.
- Owner: Data

3) Archive legacy scripts more clearly (P2)
- What: Add an `ARCHIVE.md` in `scripts/archive` outlining deprecated status and replacements.
- Impact: Reduce accidental use of old scripts.
- Owner: Data

---

## Documentation

1) Single source of version truth (P0)
- What: Add `docs/VERSIONS.md` and reference it from all docs; add a check in CI to grep for mismatches.
- Impact: Prevent future drift.
- Owner: Docs/DevOps

2) API docs link consistency (P1)
- What: Ensure all docs link to `/api/docs` on the deployed host and `http://localhost:3200/api/docs` locally.
- Impact: Fewer broken links.
- Owner: Docs

---

## Quick Wins Checklist
- [ ] Update API version to 1.1.0 in settings/urls/openapi schema
- [ ] Replace Date.now() bundling with [hash] in Vite config
- [ ] Add backend/ frontend healthchecks to compose files
- [ ] Add CI workflow for lint/typecheck/tests
- [ ] Fix frontend README versions (React 19)
- [ ] Update scripts/README version/date
- [ ] Decide on Celery/Redis usage; remove or wire up

---

If you want, I can implement the P0 items now (API version bump, Vite hash fix, healthchecks, and a minimal CI workflow).