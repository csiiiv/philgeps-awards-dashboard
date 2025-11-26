"""
Celery tasks for heavy background operations
"""
from celery import shared_task
from django.core.cache import cache
import time
import pandas as pd
from typing import Dict, List, Optional
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def send_task_update(task_id: str, state: str, **kwargs):
    """
    Send task status update via WebSocket to all subscribed clients
    
    Args:
        task_id: Celery task ID
        state: Task state (PENDING, STARTED, PROGRESS, SUCCESS, FAILURE)
        **kwargs: Additional data (status, progress, result, error)
    """
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            # Send to task-specific group
            async_to_sync(channel_layer.group_send)(
                f'task_{task_id}',
                {
                    'type': 'task_update',
                    'task_id': task_id,
                    'state': state,
                    **kwargs
                }
            )
            # Also send to general task updates group
            async_to_sync(channel_layer.group_send)(
                'task_updates',
                {
                    'type': 'task_update',
                    'task_id': task_id,
                    'state': state,
                    **kwargs
                }
            )
    except Exception as e:
        # Log error but don't fail the task
        print(f"Error sending WebSocket update: {e}")


@shared_task
def sample_add(x, y):
    """Simple test task for verifying Celery integration"""
    return x + y


@shared_task(bind=True, max_retries=3)
def export_contracts_to_excel(self, filters: Dict, export_id: str):
    """
    Export contracts to Excel file based on filter criteria.
    This is a long-running task that processes large datasets.
    
    Args:
        filters: Dictionary containing search filters (contractors, areas, etc.)
        export_id: Unique identifier for this export operation
    
    Returns:
        Dict with export status and file path
    """
    task_id = self.request.id
    
    try:
        # Notify start
        send_task_update(task_id, 'STARTED', status='Initializing export...', progress=0)
        self.update_state(state='PROGRESS', meta={'current': 0, 'total': 100, 'status': 'Initializing export...'})
        
        # Import here to avoid circular dependencies
        from contracts.parquet_search import ParquetSearchService
        
        service = ParquetSearchService()
        
        # Build query result
        send_task_update(task_id, 'PROGRESS', status='Querying data...', progress=20)
        self.update_state(state='PROGRESS', meta={'current': 20, 'total': 100, 'status': 'Querying data...'})
        
        result = service.search_contracts_with_chips_streaming(
            contractors=filters.get('contractors', []),
            areas=filters.get('areas', []),
            organizations=filters.get('organizations', []),
            business_categories=filters.get('business_categories', []),
            keywords=filters.get('keywords', []),
            time_ranges=filters.get('time_ranges', []),
            value_range=filters.get('value_range'),
            include_flood_control=filters.get('include_flood_control', False)
        )
        
        send_task_update(task_id, 'PROGRESS', status='Converting to Excel...', progress=50)
        self.update_state(state='PROGRESS', meta={'current': 50, 'total': 100, 'status': 'Converting to Excel...'})
        
        # Convert to DataFrame
        df = result.df() if result else pd.DataFrame()
        
        # Generate export file path
        import os
        from django.conf import settings
        
        export_dir = os.path.join(settings.BASE_DIR, 'exports')
        os.makedirs(export_dir, exist_ok=True)
        
        file_path = os.path.join(export_dir, f'export_{export_id}.xlsx')
        
        send_task_update(task_id, 'PROGRESS', status='Writing file...', progress=80)
        self.update_state(state='PROGRESS', meta={'current': 80, 'total': 100, 'status': 'Writing file...'})
        
        # Write to Excel
        df.to_excel(file_path, index=False, engine='openpyxl')
        
        result_data = {
            'status': 'completed',
            'file_path': file_path,
            'record_count': len(df),
            'export_id': export_id
        }
        
        # Cache the result for 1 hour
        cache.set(f'export:{export_id}', result_data, timeout=3600)
        
        # Notify completion
        send_task_update(task_id, 'SUCCESS', status='Export completed', progress=100, result=result_data)
        
        return result_data
        
    except Exception as exc:
        error_msg = str(exc)
        
        # Notify failure
        send_task_update(task_id, 'FAILURE', status='Export failed', error=error_msg)
        
        # Cache error
        cache.set(f'export:{export_id}', {
            'status': 'failed',
            'error': error_msg
        }, timeout=3600)
        
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True)
def compute_heavy_aggregates(self, filters: Dict, cache_key: str):
    """
    Compute heavy analytics aggregates in the background.
    This task processes large datasets for chart data.
    
    Args:
        filters: Dictionary containing search filters
        cache_key: Cache key to store results
    
    Returns:
        Dict with aggregate data
    """
    try:
        self.update_state(state='PROGRESS', meta={'status': 'Computing aggregates...'})
        
        # Import here to avoid circular dependencies
        from contracts.parquet_search import ParquetSearchService
        
        service = ParquetSearchService()
        
        # Perform aggregation
        result = service.chip_aggregates(
            contractors=filters.get('contractors', []),
            areas=filters.get('areas', []),
            organizations=filters.get('organizations', []),
            business_categories=filters.get('business_categories', []),
            keywords=filters.get('keywords', []),
            time_ranges=filters.get('time_ranges', []),
            value_range=filters.get('value_range'),
            include_flood_control=filters.get('include_flood_control', False)
        )
        
        # Cache result for 5 minutes
        cache.set(cache_key, result, timeout=300)
        
        return result
        
    except Exception as exc:
        cache.set(cache_key, {'status': 'error', 'message': str(exc)}, timeout=60)
        raise


@shared_task(bind=True, max_retries=2)
def process_full_table_search(self, search_params: Dict, result_key: str):
    """
    Process full-table search operations in the background.
    Useful for very large search queries that might timeout.
    
    Args:
        search_params: Search parameters including filters and pagination
        result_key: Cache key to store search results
    
    Returns:
        Dict with search results
    """
    try:
        self.update_state(state='PROGRESS', meta={'status': 'Searching...'})
        
        # Import here to avoid circular dependencies
        from contracts.parquet_search import ParquetSearchService
        
        service = ParquetSearchService()
        
        # Perform search
        results = service.search_contracts_with_chips(
            contractors=search_params.get('contractors', []),
            areas=search_params.get('areas', []),
            organizations=search_params.get('organizations', []),
            business_categories=search_params.get('business_categories', []),
            keywords=search_params.get('keywords', []),
            time_ranges=search_params.get('time_ranges', []),
            value_range=search_params.get('value_range'),
            page=search_params.get('page', 1),
            page_size=search_params.get('page_size', 20),
            include_flood_control=search_params.get('include_flood_control', False)
        )
        
        # Cache results for 10 minutes
        cache.set(result_key, results, timeout=600)
        
        return {
            'status': 'completed',
            'result_key': result_key,
            'record_count': len(results.get('results', []))
        }
        
    except Exception as exc:
        cache.set(result_key, {'status': 'error', 'message': str(exc)}, timeout=60)
        raise self.retry(exc=exc, countdown=30)


@shared_task
def cleanup_old_exports():
    """
    Periodic task to clean up old export files.
    Should be scheduled to run daily via Celery Beat.
    """
    import os
    from datetime import datetime, timedelta
    from django.conf import settings
    
    export_dir = os.path.join(settings.BASE_DIR, 'exports')
    
    if not os.path.exists(export_dir):
        return {'status': 'no_exports_dir'}
    
    # Delete files older than 24 hours
    cutoff_time = datetime.now() - timedelta(hours=24)
    deleted_count = 0
    
    for filename in os.listdir(export_dir):
        file_path = os.path.join(export_dir, filename)
        if os.path.isfile(file_path):
            file_modified = datetime.fromtimestamp(os.path.getmtime(file_path))
            if file_modified < cutoff_time:
                try:
                    os.remove(file_path)
                    deleted_count += 1
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
    
    return {
        'status': 'completed',
        'deleted_count': deleted_count
    }


@shared_task
def validate_data_integrity():
    """
    Periodic task to validate data integrity.
    Checks for missing data, invalid formats, etc.
    """
    from contracts.parquet_search import ParquetSearchService
    import os
    
    errors = []
    warnings = []
    stats = {}
    
    try:
        service = ParquetSearchService()
        
        # Check if parquet files exist
        if not service.parquet_files:
            errors.append("No parquet files found")
            return {
                'status': 'failed',
                'errors': errors,
                'warnings': warnings
            }
        
        # Check file sizes
        total_size = 0
        for file_path in service.parquet_files:
            if os.path.exists(file_path):
                size = os.path.getsize(file_path)
                total_size += size
                if size == 0:
                    errors.append(f"Empty file: {file_path}")
            else:
                errors.append(f"Missing file: {file_path}")
        
        stats['total_files'] = len(service.parquet_files)
        stats['total_size_mb'] = round(total_size / (1024 * 1024), 2)
        
        # Quick data quality check
        try:
            # Get a sample of data
            result = service.search_contracts_with_chips(
                contractors=[],
                areas=[],
                organizations=[],
                business_categories=[],
                keywords=[],
                time_ranges=[],
                page=1,
                page_size=100
            )
            
            if result and 'results' in result:
                sample_count = len(result['results'])
                stats['sample_records'] = sample_count
                
                if sample_count == 0:
                    warnings.append("No records found in sample")
                else:
                    # Check for required fields
                    first_record = result['results'][0]
                    required_fields = ['reference_id', 'award_date', 'contract_amount']
                    for field in required_fields:
                        if field not in first_record or not first_record[field]:
                            warnings.append(f"Missing or empty field: {field}")
        
        except Exception as e:
            warnings.append(f"Data quality check error: {str(e)}")
        
        return {
            'status': 'completed' if not errors else 'failed',
            'errors': errors,
            'warnings': warnings,
            'stats': stats
        }
        
    except Exception as e:
        return {
            'status': 'failed',
            'errors': [str(e)],
            'warnings': warnings
        }


@shared_task
def generate_daily_statistics():
    """
    Generate daily statistics report.
    Computes and caches key metrics for dashboards.
    """
    from contracts.parquet_search import ParquetSearchService
    from datetime import datetime, timedelta
    
    try:
        service = ParquetSearchService()
        
        # Get today's date range
        today = datetime.now().date()
        start_date = today - timedelta(days=1)
        
        # Compute overall statistics
        stats = {
            'generated_at': datetime.now().isoformat(),
            'date': today.isoformat(),
        }
        
        try:
            # Get total records across all data
            result = service.search_contracts_with_chips(
                contractors=[],
                areas=[],
                organizations=[],
                business_categories=[],
                keywords=[],
                time_ranges=[],
                page=1,
                page_size=1,
                include_flood_control=True
            )
            
            if result and 'pagination' in result:
                stats['total_contracts'] = result['pagination'].get('total_count', 0)
            
            # Get top contractors
            try:
                top_result = service.chip_aggregates(
                    contractors=[],
                    areas=[],
                    organizations=[],
                    business_categories=[],
                    keywords=[],
                    time_ranges=[],
                    include_flood_control=False
                )
                
                if top_result:
                    stats['top_contractors_count'] = len(top_result.get('top_contractors', []))
                    stats['top_organizations_count'] = len(top_result.get('top_organizations', []))
            except:
                pass
            
        except Exception as e:
            stats['error'] = str(e)
        
        # Cache statistics for 24 hours
        cache.set('daily_statistics', stats, timeout=86400)
        
        return stats
        
    except Exception as e:
        return {
            'status': 'failed',
            'error': str(e)
        }


@shared_task(bind=True, max_retries=2)
def process_chip_search_task(self, filters: Dict, cache_key: str):
    """
    Process advanced search (chip-search) as background task.
    Useful for large result sets or complex filters that might timeout.
    
    Args:
        filters: Dictionary containing search filters
        cache_key: Cache key to store search results
    
    Returns:
        Dict with search results metadata
    """
    task_id = self.request.id
    
    try:
        # Notify start
        send_task_update(task_id, 'STARTED', status='Starting search...', progress=0)
        self.update_state(state='PROGRESS', meta={'progress': 0, 'status': 'Starting search...'})
        
        # Import here to avoid circular dependencies
        from contracts.parquet_search import ParquetSearchService
        
        service = ParquetSearchService()
        
        # Update progress
        send_task_update(task_id, 'PROGRESS', status='Searching contracts...', progress=30)
        self.update_state(state='PROGRESS', meta={'progress': 30, 'status': 'Searching contracts...'})
        
        # Perform search
        result = service.search_contracts_with_chips(
            contractors=filters.get('contractors', []),
            areas=filters.get('areas', []),
            organizations=filters.get('organizations', []),
            business_categories=filters.get('business_categories', []),
            keywords=filters.get('keywords', []),
            time_ranges=filters.get('time_ranges', []),
            value_range=filters.get('value_range'),
            page=filters.get('page', 1),
            page_size=filters.get('page_size', 20),
            sort_by=filters.get('sort_by', 'award_date'),
            sort_direction=filters.get('sort_direction', 'desc'),
            include_flood_control=filters.get('include_flood_control', False)
        )
        
        # Update progress
        send_task_update(task_id, 'PROGRESS', status='Caching results...', progress=80)
        self.update_state(state='PROGRESS', meta={'progress': 80, 'status': 'Caching results...'})
        
        # Cache results for 30 minutes
        cache.set(cache_key, result, timeout=1800)
        
        result_meta = {
            'status': 'completed',
            'cache_key': cache_key,
            'record_count': len(result.get('results', [])),
            'total_count': result.get('pagination', {}).get('total_count', 0)
        }
        
        # Notify completion
        send_task_update(task_id, 'SUCCESS', status='Search completed', progress=100, result=result_meta)
        
        return result_meta
        
    except Exception as exc:
        error_msg = str(exc)
        
        # Notify failure
        send_task_update(task_id, 'FAILURE', status='Search failed', error=error_msg)
        
        # Cache error
        cache.set(cache_key, {
            'status': 'error',
            'message': error_msg
        }, timeout=300)
        
        raise self.retry(exc=exc, countdown=30)


@shared_task(bind=True, max_retries=2)
def compute_chip_aggregates_task(self, filters: Dict, cache_key: str):
    """
    Compute analytics aggregates (charts) as background task.
    For large datasets or complex aggregations that might timeout.
    
    Args:
        filters: Dictionary containing search filters
        cache_key: Cache key to store aggregate results
    
    Returns:
        Dict with aggregate results metadata
    """
    task_id = self.request.id
    
    try:
        # Notify start
        send_task_update(task_id, 'STARTED', status='Starting analytics computation...', progress=0)
        self.update_state(state='PROGRESS', meta={'progress': 0, 'status': 'Starting analytics...'})
        
        # Import here to avoid circular dependencies
        from contracts.parquet_search import ParquetSearchService
        
        service = ParquetSearchService()
        
        # Update progress
        send_task_update(task_id, 'PROGRESS', status='Computing aggregates...', progress=30)
        self.update_state(state='PROGRESS', meta={'progress': 30, 'status': 'Computing aggregates...'})
        
        # Perform aggregation
        result = service.chip_aggregates(
            contractors=filters.get('contractors', []),
            areas=filters.get('areas', []),
            organizations=filters.get('organizations', []),
            business_categories=filters.get('business_categories', []),
            keywords=filters.get('keywords', []),
            time_ranges=filters.get('time_ranges', []),
            value_range=filters.get('value_range'),
            include_flood_control=filters.get('include_flood_control', False)
        )
        
        # Update progress
        send_task_update(task_id, 'PROGRESS', status='Caching results...', progress=80)
        self.update_state(state='PROGRESS', meta={'progress': 80, 'status': 'Caching results...'})
        
        # Cache result for 30 minutes
        cache.set(cache_key, result, timeout=1800)
        
        result_meta = {
            'status': 'completed',
            'cache_key': cache_key,
            'top_contractors_count': len(result.get('top_contractors', [])),
            'top_organizations_count': len(result.get('top_organizations', []))
        }
        
        # Notify completion
        send_task_update(task_id, 'SUCCESS', status='Analytics completed', progress=100, result=result_meta)
        
        return result_meta
        
    except Exception as exc:
        error_msg = str(exc)
        
        # Notify failure
        send_task_update(task_id, 'FAILURE', status='Analytics computation failed', error=error_msg)
        
        # Cache error
        cache.set(cache_key, {
            'status': 'error',
            'message': error_msg
        }, timeout=300)
        
        raise self.retry(exc=exc, countdown=30)


@shared_task(bind=True, max_retries=2)
def compute_chip_aggregates_paginated_task(self, filters: Dict, entity_type: str, page: int, page_size: int, cache_key: str):
    """
    Compute paginated analytics aggregates as background task.
    For analytics table with many entities.
    
    Args:
        filters: Dictionary containing search filters
        entity_type: Type of entity to aggregate (contractor, organization, area, category)
        page: Page number
        page_size: Number of entities per page
        cache_key: Cache key to store results
    
    Returns:
        Dict with paginated aggregate results metadata
    """
    task_id = self.request.id
    
    try:
        # Notify start
        send_task_update(task_id, 'STARTED', status='Starting paginated analytics...', progress=0)
        self.update_state(state='PROGRESS', meta={'progress': 0, 'status': 'Starting analytics...'})
        
        # Import here to avoid circular dependencies
        from contracts.parquet_search import ParquetSearchService
        
        service = ParquetSearchService()
        
        # Update progress
        send_task_update(task_id, 'PROGRESS', status='Computing paginated aggregates...', progress=30)
        self.update_state(state='PROGRESS', meta={'progress': 30, 'status': 'Computing aggregates...'})
        
        # Perform aggregation
        result = service.chip_aggregates_paginated(
            contractors=filters.get('contractors', []),
            areas=filters.get('areas', []),
            organizations=filters.get('organizations', []),
            business_categories=filters.get('business_categories', []),
            keywords=filters.get('keywords', []),
            time_ranges=filters.get('time_ranges', []),
            value_range=filters.get('value_range'),
            entity_type=entity_type,
            page=page,
            page_size=page_size,
            include_flood_control=filters.get('include_flood_control', False)
        )
        
        # Update progress
        send_task_update(task_id, 'PROGRESS', status='Caching results...', progress=80)
        self.update_state(state='PROGRESS', meta={'progress': 80, 'status': 'Caching results...'})
        
        # Cache result for 30 minutes
        cache.set(cache_key, result, timeout=1800)
        
        result_meta = {
            'status': 'completed',
            'cache_key': cache_key,
            'entity_count': len(result.get('data', [])),
            'page': page,
            'page_size': page_size
        }
        
        # Notify completion
        send_task_update(task_id, 'SUCCESS', status='Analytics table completed', progress=100, result=result_meta)
        
        return result_meta
        
    except Exception as exc:
        error_msg = str(exc)
        
        # Notify failure
        send_task_update(task_id, 'FAILURE', status='Analytics table computation failed', error=error_msg)
        
        # Cache error
        cache.set(cache_key, {
            'status': 'error',
            'message': error_msg
        }, timeout=300)
        
        raise self.retry(exc=exc, countdown=30)


@shared_task
def health_check_system():
    """
    Periodic health check of system components.
    Checks Redis, Celery workers, data files, etc.
    """
    import os
    from django.core.cache import cache
    from django.conf import settings
    
    health_status = {
        'timestamp': time.time(),
        'components': {}
    }
    
    # Check Redis
    try:
        cache.set('health_check', 'ok', timeout=10)
        test_value = cache.get('health_check')
        health_status['components']['redis'] = {
            'status': 'healthy' if test_value == 'ok' else 'unhealthy',
            'message': 'Redis connection successful'
        }
    except Exception as e:
        health_status['components']['redis'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
    
    # Check data files
    try:
        from contracts.parquet_search import ParquetSearchService
        service = ParquetSearchService()
        health_status['components']['data_files'] = {
            'status': 'healthy' if service.parquet_files else 'unhealthy',
            'file_count': len(service.parquet_files),
            'message': f'Found {len(service.parquet_files)} parquet files'
        }
    except Exception as e:
        health_status['components']['data_files'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
    
    # Check exports directory
    export_dir = os.path.join(settings.BASE_DIR, 'exports')
    try:
        if os.path.exists(export_dir):
            export_count = len([f for f in os.listdir(export_dir) if os.path.isfile(os.path.join(export_dir, f))])
            health_status['components']['exports'] = {
                'status': 'healthy',
                'export_count': export_count,
                'directory': export_dir
            }
        else:
            health_status['components']['exports'] = {
                'status': 'warning',
                'message': 'Exports directory does not exist'
            }
    except Exception as e:
        health_status['components']['exports'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
    
    # Overall status
    unhealthy_count = sum(1 for comp in health_status['components'].values() if comp['status'] == 'unhealthy')
    health_status['overall_status'] = 'healthy' if unhealthy_count == 0 else 'unhealthy'
    health_status['unhealthy_components'] = unhealthy_count
    
    # Cache health status for 5 minutes
    cache.set('system_health', health_status, timeout=300)
    
    return health_status