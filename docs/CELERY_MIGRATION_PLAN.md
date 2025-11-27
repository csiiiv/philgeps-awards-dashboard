# Celery Migration Plan - Moving Heavy Operations to Queue

## 🎯 Goal

Migrate potentially slow operations to use Celery queue system to prevent timeouts and improve user experience with large datasets.

## 📋 Operations to Migrate

### 1. Advanced Search / Drill-downs
- **Current:** Synchronous `POST /api/v1/contracts/chip-search/`
- **Issue:** Can timeout with large result sets or complex filters
- **Solution:** Create async task `process_chip_search_task`

### 2. Analytics Aggregates
- **Current:** Synchronous `POST /api/v1/contracts/chip-aggregates/`
- **Issue:** Can be slow with full database scans
- **Solution:** Create async task `compute_chip_aggregates_task`

### 3. Analytics Table (Paginated)
- **Current:** Synchronous `POST /api/v1/contracts/chip-aggregates-paginated/`
- **Issue:** Large aggregations can timeout
- **Solution:** Create async task `compute_chip_aggregates_paginated_task`

## 🔄 Implementation Strategy

### Hybrid Approach (Recommended)

Instead of forcing everything through Celery, use a **smart routing system**:

```python
def should_use_celery(filters, operation_type):
    """
    Decide if operation should use Celery based on:
    - Dataset size
    - Filter complexity
    - Operation type
    """
    # No filters = full table scan = use Celery
    if not has_filters(filters):
        return True
    
    # Estimate result size
    estimated_size = estimate_query_size(filters)
    
    # Large results = use Celery
    if estimated_size > 10000:
        return True
    
    # Complex aggregations = use Celery
    if operation_type == 'analytics' and estimated_size > 5000:
        return True
    
    # Otherwise, synchronous is fine
    return False
```

### API Design

Keep both synchronous and asynchronous endpoints:

```
Synchronous (for quick operations):
POST /api/v1/contracts/chip-search/
POST /api/v1/contracts/chip-aggregates/

Asynchronous (for heavy operations):
POST /api/v1/data-processing/tasks/search/
POST /api/v1/data-processing/tasks/analytics/
```

Frontend can:
1. Try synchronous first
2. If times out or returns "too large", switch to async
3. Or always use async for safety

## 📊 Implementation Phases

### Phase 1: Create Celery Tasks (Backend)
- [ ] `process_chip_search_task` - Advanced search
- [ ] `compute_chip_aggregates_task` - Analytics charts
- [ ] `compute_chip_aggregates_paginated_task` - Analytics table
- [ ] Add progress updates via WebSocket
- [ ] Cache results in Redis

### Phase 2: Add API Endpoints (Backend)
- [ ] `POST /api/v1/data-processing/tasks/search/`
- [ ] `POST /api/v1/data-processing/tasks/analytics/`
- [ ] `POST /api/v1/data-processing/tasks/analytics-paginated/`
- [ ] Add result retrieval endpoints

### Phase 3: Update Frontend
- [ ] Add loading states with "Processing..." message
- [ ] Show TaskManager progress for long operations
- [ ] Poll task status
- [ ] Retrieve and display results when complete
- [ ] Handle errors gracefully

### Phase 4: Smart Routing (Optional)
- [ ] Add size estimation endpoint
- [ ] Frontend decides sync vs async
- [ ] Fallback to async on timeout

## 🔧 Technical Details

### Task Structure

```python
@shared_task(bind=True)
def process_chip_search_task(self, filters):
    """
    Process chip search in background with progress updates
    """
    try:
        # Update progress
        self.update_state(state='PROGRESS', meta={'progress': 0})
        
        # Execute search
        service = ParquetSearchService()
        results = service.search_contracts_with_chips(filters)
        
        # Update progress
        self.update_state(state='PROGRESS', meta={'progress': 50})
        
        # Cache results
        cache_key = f"search_results_{self.request.id}"
        cache.set(cache_key, results, timeout=3600)  # 1 hour
        
        # Send WebSocket update
        send_task_update({
            'task_id': self.request.id,
            'status': 'SUCCESS',
            'progress': 100
        })
        
        return {
            'status': 'SUCCESS',
            'cache_key': cache_key,
            'count': len(results)
        }
    except Exception as e:
        send_task_update({
            'task_id': self.request.id,
            'status': 'FAILED',
            'error': str(e)
        })
        raise
```

### Frontend Flow

```typescript
// Advanced Search with async support
const handleSearch = async () => {
  setLoading(true);
  
  try {
    // Option 1: Always use async for large datasets
    const response = await fetch('/api/v1/data-processing/tasks/search/', {
      method: 'POST',
      body: JSON.stringify(filters)
    });
    
    const { task_id } = await response.json();
    
    // Poll for results
    const results = await pollTaskResults(task_id);
    setSearchResults(results);
    
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
};

// Poll task status
const pollTaskResults = async (taskId: string) => {
  while (true) {
    const status = await checkTaskStatus(taskId);
    
    if (status.state === 'SUCCESS') {
      // Retrieve results from cache
      return await fetchCachedResults(status.cache_key);
    }
    
    if (status.state === 'FAILED') {
      throw new Error(status.error);
    }
    
    // Update progress bar
    setProgress(status.progress);
    
    // Wait before next poll
    await sleep(1000);
  }
};
```

## 🎨 User Experience

### Before (Synchronous)
```
User clicks Search → Waits... → Waits... → Timeout! ❌
```

### After (Asynchronous)
```
User clicks Search → Task queued ✓
                   ↓
              Progress bar shows 0%
                   ↓
              Progress updates: 25%... 50%... 75%
                   ↓
              Results appear ✓
```

## 📈 Performance Impact

### With 4 Workers

| Operation | Dataset Size | Old Time | New Time | User Experience |
|-----------|--------------|----------|----------|-----------------|
| Search | 100K rows | 30s (timeout) | 45s | Progress bar, no timeout |
| Analytics | Full DB | 60s (timeout) | 90s | Background processing |
| Drill-down | 50K rows | 15s (slow) | 20s | Non-blocking |

### Benefits

1. **No Timeouts** - Operations can run as long as needed
2. **Non-Blocking** - User can continue using app
3. **Better Feedback** - Progress bars and status updates
4. **Scalable** - Add more workers for better performance
5. **Resilient** - Tasks survive server restarts
6. **Cached** - Results stored for quick retrieval

## ⚠️ Considerations

### Pros
✅ No timeouts for large operations
✅ Better UX with progress indicators
✅ Non-blocking interface
✅ Scalable architecture
✅ Can handle huge datasets

### Cons
❌ Slightly slower for small operations (task overhead)
❌ More complex frontend code
❌ Requires polling or WebSocket
❌ Results stored in cache (memory usage)

### Solution: Hybrid Approach

Use **both** approaches:
- Small/quick operations → Synchronous (existing endpoints)
- Large/slow operations → Asynchronous (new Celery tasks)

Let frontend decide based on:
- Dataset size estimation
- User preference
- Previous operation performance

## 🚀 Rollout Plan

### Stage 1: Add Async Endpoints (Keep Existing)
- Implement Celery tasks
- Add new async API endpoints
- Keep existing sync endpoints working
- Test thoroughly

### Stage 2: Update Frontend (Optional)
- Add async support to components
- Show progress indicators
- Keep sync as fallback

### Stage 3: Smart Routing (Optional)
- Add size estimation
- Auto-route large operations to async
- Keep small operations sync

### Stage 4: Monitoring
- Track operation times
- Monitor queue depth
- Adjust worker count as needed

## 🎯 Decision: Implement Now?

**Recommendation:** YES, if:
- You have datasets > 100K rows
- Operations frequently timeout
- Users complain about slowness
- You expect growth in data size

**Can Wait:** If:
- Current performance is acceptable
- Datasets are < 50K rows
- Operations complete in < 10 seconds
- Users are satisfied

## 📝 Next Steps

1. Review this plan
2. Decide on implementation scope
3. Choose: Full migration or hybrid approach
4. Implement backend Celery tasks
5. Update frontend components
6. Test with real dataset
7. Monitor and tune performance

---

**Ready to implement?** Let me know and I'll start with the backend Celery tasks! 🚀

