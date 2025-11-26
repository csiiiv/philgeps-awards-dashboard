# Frontend & API Endpoints Guide

## 🌐 What You Should See When Accessing the Website

When you access `http://localhost:3000` (or `https://philgeps.simple-systems.dev` in production), you should see:

### Navigation Tabs

1. **📊 Data Explorer** (Home - `/`)
   - Main data exploration interface
   - Entity filters (contractors, organizations, areas, business categories)
   - Time range filters
   - Data summary cards
   - Results table with pagination
   - Export functionality

2. **🔍 Advanced Search** (`/advanced-search`)
   - More sophisticated search interface
   - Predefined filter templates
   - Keyword and full-text search
   - Advanced filtering options
   - Results with drill-down capabilities
   - **Analytics button** → Opens analytics modal with charts and aggregates
   - Export functionality

3. **🌳 Treemap** (`/treemap`)
   - Visual treemap representation of data
   - Interactive visualization
   - Hierarchical data display

4. **📖 API Docs** (`/api-docs`)
   - API documentation
   - Available endpoints
   - Request/response examples

5. **❓ Help** (`/help`)
   - User guide
   - Feature explanations
   - FAQ

6. **ℹ️ About** (`/about`)
   - Project information
   - Data sources
   - Methodology
   - Architecture details

---

## 🔗 API Endpoints Overview

### Current Architecture: **Hybrid Approach**

Your system uses **BOTH synchronous and asynchronous** endpoints depending on the operation:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
└────────────┬────────────────────────────────┬───────────────┘
             │                                 │
             │                                 │
   ┌─────────▼──────────┐          ┌─────────▼──────────────┐
   │  SYNCHRONOUS API   │          │  ASYNCHRONOUS API      │
   │  (Immediate)       │          │  (Celery Tasks)        │
   └─────────┬──────────┘          └─────────┬──────────────┘
             │                                 │
             │                                 │
    Quick operations                  Long-running operations
    (< 5 seconds)                     (> 30 seconds)
```

---

## ✅ What's Currently Working (Synchronous)

These endpoints work **immediately** without Celery queuing:

### 1. **Data Explorer** (`/`)
- **Endpoint:** `POST /api/v1/contracts/advanced-search/`
- **What it does:** Basic data exploration and filtering
- **Response time:** ~1-3 seconds
- **Status:** ✅ Fully functional
- **Uses Celery:** ❌ No (not needed)

### 2. **Advanced Search** (`/advanced-search`)

#### Search Results
- **Endpoint:** `POST /api/v1/contracts/chip-search/`
- **What it does:** Advanced search with CHIP filters
- **Response time:** ~2-5 seconds
- **Status:** ✅ Fully functional
- **Uses Celery:** ❌ No (not needed)

#### Analytics Modal
- **Endpoint:** `POST /api/v1/contracts/chip-aggregates/`
- **What it does:** Generate charts and summary statistics
- **Response time:** ~3-10 seconds
- **Status:** ✅ Fully functional
- **Uses Celery:** ❌ No (cached for 5 minutes)

#### Analytics Table (Paginated)
- **Endpoint:** `POST /api/v1/contracts/chip-aggregates-paginated/`
- **What it does:** Detailed aggregates for analytics table
- **Response time:** ~2-5 seconds
- **Status:** ✅ Fully functional
- **Uses Celery:** ❌ No (paginated + cached)

#### Entity Drill-Down
- **Endpoint:** `POST /api/v1/contracts/chip-search/`
- **What it does:** Show contracts for a specific entity
- **Response time:** ~1-3 seconds
- **Status:** ✅ Fully functional
- **Uses Celery:** ❌ No (not needed)

### 3. **Filter Options**
- **Endpoint:** `GET /api/v1/contracts/filter-options/`
- **What it does:** Load available contractors, organizations, areas, categories
- **Response time:** ~1-2 seconds
- **Status:** ✅ Fully functional
- **Uses Celery:** ❌ No (not needed)

### 4. **Export Estimates**
- **Endpoint:** `POST /api/v1/contracts/chip-export-estimate/`
- **What it does:** Estimate export file size before downloading
- **Response time:** ~1-2 seconds
- **Status:** ✅ Fully functional
- **Uses Celery:** ❌ No (cached for 10 minutes)

---

## 🚀 What Uses Celery (Asynchronous)

These operations use the **Celery queue system** for long-running tasks:

### 1. **Large Excel Exports**
- **API Endpoint:** `POST /api/v1/data-processing/tasks/export/`
- **Celery Task:** `export_contracts_to_excel`
- **What it does:** Export large datasets to Excel with formatting
- **When to use:** Exports with > 10,000 rows or complex formatting
- **Response time:** 30 seconds - 5 minutes
- **Status:** ✅ Implemented (Phase 2)
- **Frontend:** TaskManager component shows progress

**How it works:**
```
1. User clicks "Export"
2. Frontend sends request to /tasks/export/
3. Backend immediately returns task_id
4. Celery worker processes in background
5. Frontend shows progress bar via WebSocket
6. User downloads when complete
```

### 2. **Heavy Aggregates Computation**
- **API Endpoint:** `POST /api/v1/data-processing/tasks/aggregates/`
- **Celery Task:** `compute_heavy_aggregates`
- **What it does:** Compute CHIP aggregates for very large datasets
- **When to use:** Computing aggregates across entire database
- **Response time:** 1-10 minutes
- **Status:** ✅ Implemented (Phase 2)

### 3. **Scheduled Tasks** (Automatic)
These run automatically via Celery Beat:

- **cleanup_old_exports** - Daily at 2 AM
- **validate_data_integrity** - Every hour
- **generate_daily_statistics** - Daily at 1 AM
- **health_check_system** - Every 15 minutes

---

## ❓ Should More Endpoints Use Celery?

### No - These Are Fine Being Synchronous

✅ **Advanced Search** (`chip-search`)
- Usually completes in 2-5 seconds
- Paginated results (20-100 rows at a time)
- Results are cached
- Users expect immediate feedback

✅ **Analytics Aggregates** (`chip-aggregates`)
- Cached for 5 minutes
- Optimized queries with DuckDB
- Usually < 10 seconds
- Users need immediate visual feedback

✅ **Drill-downs** (`chip-search` with entity filter)
- Very fast (filtered queries)
- Small result sets
- Immediate interaction expected

✅ **Filter Options** (`filter-options`)
- Very fast lookups
- Cached results
- Needed before user can search

### Maybe - Consider Celery for These Cases

⚠️ **Very Large Exports** (> 50,000 rows)
- **Current:** Synchronous via `chip-export`
- **Recommended:** Already handled by Celery task `export_contracts_to_excel`
- **Action:** Update frontend to use Celery endpoint for large exports

⚠️ **Full Database Aggregates** (no filters)
- **Current:** Synchronous via `chip-aggregates`
- **Recommended:** Use Celery task `compute_heavy_aggregates`
- **Action:** Detect large computations and route to Celery

---

## 🎯 Current Implementation Status

### ✅ What's Working

| Feature | Endpoint | Method | Celery? | Status |
|---------|----------|--------|---------|--------|
| Data Explorer | `/contracts/advanced-search/` | Sync | No | ✅ Working |
| Advanced Search | `/contracts/chip-search/` | Sync | No | ✅ Working |
| Analytics Charts | `/contracts/chip-aggregates/` | Sync | No | ✅ Working |
| Analytics Table | `/contracts/chip-aggregates-paginated/` | Sync | No | ✅ Working |
| Drill-downs | `/contracts/chip-search/` | Sync | No | ✅ Working |
| Small Exports | `/contracts/chip-export/` | Sync | No | ✅ Working |
| Large Exports | `/data-processing/tasks/export/` | Async | Yes | ✅ Working |
| Heavy Aggregates | `/data-processing/tasks/aggregates/` | Async | Yes | ✅ Working |
| Task Status | `/data-processing/tasks/status/` | Sync | N/A | ✅ Working |
| Active Tasks | `/data-processing/tasks/active/` | Sync | N/A | ✅ Working |

### 🔨 What Could Be Added (Optional)

| Feature | Priority | Effort | Benefit |
|---------|----------|--------|---------|
| Auto-route large exports to Celery | Medium | Low | Better UX for large exports |
| Background report generation | Low | Medium | Pre-compute daily reports |
| Data refresh tasks | Low | Low | Auto-update cached data |
| Bulk data imports | Medium | Medium | Handle large uploads |

---

## 🧪 How to Verify Everything Works

### 1. Test Data Explorer
```bash
# Open browser
http://localhost:3000/

# You should see:
✓ Filter dropdowns populated
✓ Data summary cards
✓ Results table with data
✓ Pagination controls
✓ Export button
```

### 2. Test Advanced Search
```bash
# Navigate to Advanced Search tab
http://localhost:3000/advanced-search

# Test drill-downs:
1. Click "Search" to get results
2. Click on any contractor name
3. Modal should open with contracts for that contractor
4. Should show related entities

# Test analytics:
1. Click "Search"
2. Click "Show Analytics"
3. Modal should open with:
   ✓ Charts (bar, pie, line)
   ✓ Summary statistics
   ✓ Top contractors/organizations
   ✓ Analytics table
```

### 3. Test Celery Tasks
```bash
# Method 1: Via stress test script
cd test
./stress_test_simple.sh

# Method 2: Via API
curl -X POST http://localhost:3200/api/v1/data-processing/tasks/export/ \
  -H "Content-Type: application/json" \
  -d '{
    "contractors": [],
    "areas": [],
    "organizations": [],
    "business_categories": [],
    "keywords": [],
    "time_ranges": []
  }'

# Should return:
{
  "task_id": "abc-123-def-456",
  "status": "PENDING",
  "message": "Export task started"
}
```

### 4. Check Real-time Updates
```bash
# Open browser console
http://localhost:3000/

# Look for:
WebSocket connected
Task updates received
Progress bars updating
```

### 5. Verify All Services
```bash
# Check service health
docker compose -f docker-compose.backend.yml ps

# Should show:
✓ philgeps-backend (healthy)
✓ philgeps-rabbitmq (healthy)
✓ philgeps-redis (healthy)
✓ philgeps-celeryworker (running)
✓ philgeps-celerybeat (running)

# Check frontend
docker compose -f docker-compose.frontend.yml ps

# Should show:
✓ philgeps-frontend (healthy)
```

---

## 🚨 Troubleshooting

### "No data showing in Data Explorer"

**Possible causes:**
1. No parquet files loaded
2. Backend not running
3. Frontend can't reach backend

**Check:**
```bash
# 1. Check backend is running
docker logs philgeps-backend --tail=50

# 2. Check API directly
curl http://localhost:3200/api/v1/contracts/filter-options/

# 3. Check browser console for CORS errors
```

### "Analytics not loading"

**Possible causes:**
1. Search results empty
2. API endpoint error
3. Frontend state issue

**Check:**
```bash
# 1. Verify search returns results first
# 2. Check network tab in browser DevTools
# 3. Look for error messages in console
```

### "Drill-down modal not working"

**Possible causes:**
1. Entity name not properly passed
2. API filtering issue

**Check:**
```bash
# Browser console should show:
# "Opening drill-down for: [entity name]"
# Check network tab for API call
```

### "Task progress not updating"

**Possible causes:**
1. WebSocket not connected
2. Celery worker not running
3. Redis not accessible

**Check:**
```bash
# 1. Check browser console for WebSocket errors
# 2. Verify worker is running
docker logs philgeps-celeryworker -f

# 3. Check Redis
docker exec philgeps-redis redis-cli PING
```

---

## 📊 Performance Expectations

### Synchronous Endpoints (Immediate Response)

| Operation | Expected Time | Max Acceptable |
|-----------|---------------|----------------|
| Filter options | < 1s | 2s |
| Search (paginated) | 1-3s | 5s |
| Analytics charts | 3-5s | 10s |
| Analytics table | 2-4s | 8s |
| Drill-down | 1-2s | 5s |
| Export estimate | < 1s | 2s |

### Asynchronous Endpoints (Background Tasks)

| Operation | Expected Time | Data Size |
|-----------|---------------|-----------|
| Small export | 10-30s | < 1,000 rows |
| Medium export | 30-120s | 1,000-10,000 rows |
| Large export | 2-10 min | > 10,000 rows |
| Heavy aggregates | 1-5 min | Full database |

---

## 🎨 Frontend Features Available

### Current Features (✅ Implemented)

1. **Data Explorer**
   - ✅ Entity filtering
   - ✅ Time range filtering
   - ✅ Value range filtering
   - ✅ Summary cards
   - ✅ Results table
   - ✅ Pagination
   - ✅ Sorting
   - ✅ Export

2. **Advanced Search**
   - ✅ Keyword search
   - ✅ Predefined filters
   - ✅ Advanced filters
   - ✅ Results table
   - ✅ **Analytics modal** (charts + aggregates)
   - ✅ **Drill-down modals** (entity details)
   - ✅ Export

3. **Task Management**
   - ✅ TaskManager component
   - ✅ Real-time progress bars
   - ✅ Task history
   - ✅ Download completed tasks
   - ✅ Cancel running tasks

4. **Treemap Visualization**
   - ✅ Interactive treemap
   - ✅ Hierarchical display

5. **Theme Support**
   - ✅ Light/dark mode
   - ✅ Persistent preference

---

## 📝 Summary

### What You Should See Right Now

✅ **Data Explorer** - Works perfectly (synchronous)  
✅ **Advanced Search** - Works perfectly (synchronous)  
✅ **Analytics** - Works perfectly (synchronous with caching)  
✅ **Drill-downs** - Works perfectly (synchronous)  
✅ **Small exports** - Works perfectly (synchronous)  
✅ **Large exports** - Works with Celery (asynchronous)  
✅ **Real-time updates** - Works via WebSocket  

### What's Not Using Celery (By Design)

The following are **intentionally synchronous** because they're fast enough:
- Search results (paginated, < 5s)
- Analytics charts (cached, < 10s)
- Drill-downs (filtered, < 3s)
- Filter options (lookup, < 2s)

### What IS Using Celery

Only operations that take > 30 seconds:
- Large Excel exports (10,000+ rows)
- Full database aggregates
- Scheduled maintenance tasks

---

**This is the correct architecture!** 🎯

Not everything needs to be queued. Only long-running operations should use Celery to avoid blocking the system. Your current implementation follows best practices.

---

## 🚀 Next Steps (Optional)

If you want to enhance the system:

1. **Smart Export Routing**
   - Detect export size
   - Route small exports → synchronous
   - Route large exports → Celery

2. **Progress Indicators for Sync Operations**
   - Add loading states
   - Show operation progress
   - Improve UX feedback

3. **Background Report Generation**
   - Pre-compute popular reports
   - Cache results
   - Serve instantly

But these are **optional** - your system is fully functional as-is! ✅

