from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
import json
import uuid
from celery.result import AsyncResult
from django.core.cache import cache

from .parquet_service import parquet_service

@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    """Lightweight health endpoint for container probes"""
    return Response({"status": "ok"})

@extend_schema(
    operation_id='data_processing_home',
    summary='Data Processing Home',
    description='Basic data processing home view',
    responses={
        200: OpenApiResponse(description='Success response'),
    },
    tags=['data-processing']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def data_processing_home(request):
    """Basic data processing home view"""
    return Response({
        'message': 'Data Processing API is working',
        'status': 'success'
    })

@extend_schema(
    operation_id='query_entities',
    summary='Query Entities',
    description='Query entities with pagination and filtering',
    parameters=[
        OpenApiParameter(name='entity_type', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='Type of entity to query'),
        OpenApiParameter(name='page_index', type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, description='Page index for pagination'),
        OpenApiParameter(name='page_size', type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, description='Number of items per page'),
        OpenApiParameter(name='time_range', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='Time range filter'),
        OpenApiParameter(name='year', type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, description='Year filter'),
        OpenApiParameter(name='quarter', type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, description='Quarter filter'),
        OpenApiParameter(name='start_date', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='Start date filter'),
        OpenApiParameter(name='end_date', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='End date filter'),
        OpenApiParameter(name='search', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='Search query'),
        OpenApiParameter(name='sort_by', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='Sort field'),
        OpenApiParameter(name='sort_dir', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='Sort direction'),
        OpenApiParameter(name='include_flood_control', type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY, description='Include flood control data'),
    ],
    responses={
        200: OpenApiResponse(description='Success response with entity data'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def query_entities(request):
    """Query entities with pagination and filtering"""
    try:
        # Get query parameters
        entity_type = request.GET.get('entity_type', 'contractors')
        page_index = int(request.GET.get('page_index', 0))
        page_size = int(request.GET.get('page_size', 10))
        time_range = request.GET.get('time_range', 'all_time')
        year = request.GET.get('year')
        quarter = request.GET.get('quarter')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        search_query = request.GET.get('search', '')
        sort_by = request.GET.get('sort_by', 'total_contract_value')
        sort_dir = request.GET.get('sort_dir', 'DESC')
        include_flood_control = request.GET.get('include_flood_control', 'false').lower() == 'true'
        
        # Convert year and quarter to integers if provided
        year = int(year) if year else None
        quarter = int(quarter) if quarter else None
        
        # Query the data
        result = parquet_service.query_entities_paged(
            entity_type=entity_type,
            page_index=page_index,
            page_size=page_size,
            time_range=time_range,
            year=year,
            quarter=quarter,
            start_date=start_date,
            end_date=end_date,
            search_query=search_query if search_query else None,
            sort_by=sort_by,
            sort_dir=sort_dir,
            include_flood_control=include_flood_control
        )
        
        return Response(result)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@extend_schema(
    operation_id='query_related_entities',
    summary='Query Related Entities',
    description='Query related entities for drill-down functionality',
    parameters=[
        OpenApiParameter(name='source_dim', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='Source dimension'),
        OpenApiParameter(name='source_value', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='Source value'),
        OpenApiParameter(name='target_dim', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='Target dimension'),
        OpenApiParameter(name='limit', type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, description='Limit number of results'),
        OpenApiParameter(name='time_range', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='Time range filter'),
        OpenApiParameter(name='year', type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, description='Year filter'),
        OpenApiParameter(name='quarter', type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, description='Quarter filter'),
    ],
    responses={
        200: OpenApiResponse(description='Success response with related entity data'),
        400: OpenApiResponse(description='Bad request - missing required parameters'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def query_related_entities(request):
    """Query related entities for drill-down functionality"""
    try:
        source_dim = request.GET.get('source_dim')
        source_value = request.GET.get('source_value')
        target_dim = request.GET.get('target_dim')
        limit = int(request.GET.get('limit', 10))
        time_range = request.GET.get('time_range', 'all_time')
        year = request.GET.get('year')
        quarter = request.GET.get('quarter')
        
        if not all([source_dim, source_value, target_dim]):
            return Response({'error': 'Missing required parameters'}, status=400)
        
        year = int(year) if year else None
        quarter = int(quarter) if quarter else None
        
        result = parquet_service.query_related_entities(
            source_dim=source_dim,
            source_value=source_value,
            target_dim=target_dim,
            limit=limit,
            time_range=time_range,
            year=year,
            quarter=quarter
        )
        
        return Response(result)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@extend_schema(
    operation_id='query_contracts_by_entity',
    summary='Query Contracts by Entity',
    description='Query contracts filtered by entity dimensions',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'filters': {
                    'type': 'array',
                    'items': {'type': 'object'},
                    'description': 'Array of filter objects'
                },
                'page_index': {'type': 'integer', 'description': 'Page index'},
                'page_size': {'type': 'integer', 'description': 'Page size'},
                'order_by': {'type': 'string', 'description': 'Order by clause'},
                'time_range': {'type': 'string', 'description': 'Time range filter'},
                'year': {'type': 'integer', 'description': 'Year filter'},
                'quarter': {'type': 'integer', 'description': 'Quarter filter'},
            }
        }
    },
    responses={
        200: OpenApiResponse(description='Success response with contract data'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def query_contracts_by_entity(request):
    """Query contracts filtered by entity dimensions"""
    try:
        data = request.data
        
        # Handle case where data might be a list instead of dict
        if isinstance(data, list):
            filters = data
            page_index = 0
            page_size = 20
            order_by = 'award_date DESC'
            time_range = 'all_time'
            year = None
            quarter = None
        else:
            filters = data.get('filters', [])
            page_index = data.get('page_index', 0)
            page_size = data.get('page_size', 20)
            order_by = data.get('order_by', 'award_date DESC')
            time_range = data.get('time_range', 'all_time')
            year = data.get('year')
            quarter = data.get('quarter')
        
        year = int(year) if year else None
        quarter = int(quarter) if quarter else None
        
        result = parquet_service.query_contracts_by_entity(
            filters=filters,
            page_index=page_index,
            page_size=page_size,
            order_by=order_by,
            time_range=time_range,
            year=year,
            quarter=quarter
        )
        
        return Response(result)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@extend_schema(
    operation_id='get_available_time_ranges',
    summary='Get Available Time Ranges',
    description='Get available time ranges and years/quarters',
    responses={
        200: OpenApiResponse(description='Success response with available time ranges'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_available_time_ranges(request):
    """Get available time ranges and years/quarters"""
    try:
        result = parquet_service.get_available_time_ranges()
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# Removed advanced_search_contracts function - duplicate of contracts/views.py advanced_search
# Use /api/v1/contracts/advanced-search/ instead

# =============================================================================
# CELERY TASK MANAGEMENT ENDPOINTS
# =============================================================================

from celery.result import AsyncResult
from django.core.cache import cache
import uuid

@extend_schema(
    operation_id='trigger_export',
    summary='Trigger Background Export',
    description='Trigger a background task to export contracts to Excel',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'filters': {
                    'type': 'object',
                    'description': 'Filter criteria for export',
                    'properties': {
                        'contractors': {'type': 'array', 'items': {'type': 'string'}},
                        'areas': {'type': 'array', 'items': {'type': 'string'}},
                        'organizations': {'type': 'array', 'items': {'type': 'string'}},
                        'business_categories': {'type': 'array', 'items': {'type': 'string'}},
                        'keywords': {'type': 'array', 'items': {'type': 'string'}},
                        'time_ranges': {'type': 'array', 'items': {'type': 'object'}},
                        'value_range': {'type': 'object'},
                        'include_flood_control': {'type': 'boolean'}
                    }
                }
            },
            'required': ['filters']
        }
    },
    responses={
        202: OpenApiResponse(description='Export task queued successfully'),
        400: OpenApiResponse(description='Invalid request'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def trigger_export(request):
    """Trigger a background export task"""
    try:
        from .tasks import export_contracts_to_excel
        
        filters = request.data.get('filters', {})
        export_id = str(uuid.uuid4())
        
        # Queue the task
        task = export_contracts_to_excel.delay(filters, export_id)
        
        return Response({
            'status': 'queued',
            'task_id': task.id,
            'export_id': export_id,
            'message': 'Export task has been queued. Check status using the task_id.'
        }, status=202)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@extend_schema(
    operation_id='trigger_aggregates',
    summary='Trigger Background Aggregates Computation',
    description='Trigger a background task to compute heavy aggregates',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'filters': {
                    'type': 'object',
                    'description': 'Filter criteria for aggregates'
                }
            },
            'required': ['filters']
        }
    },
    responses={
        202: OpenApiResponse(description='Aggregates task queued successfully'),
        400: OpenApiResponse(description='Invalid request'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def trigger_aggregates(request):
    """Trigger a background aggregates computation task"""
    try:
        from .tasks import compute_heavy_aggregates
        import hashlib
        
        filters = request.data.get('filters', {})
        
        # Generate cache key
        request_body = json.dumps(filters, sort_keys=True)
        cache_key = f"agg:{hashlib.md5(request_body.encode()).hexdigest()}"
        
        # Check if result already exists in cache
        cached_result = cache.get(cache_key)
        if cached_result is not None:
            return Response({
                'status': 'cached',
                'data': cached_result,
                'message': 'Results already available in cache'
            }, status=200)
        
        # Queue the task
        task = compute_heavy_aggregates.delay(filters, cache_key)
        
        return Response({
            'status': 'queued',
            'task_id': task.id,
            'cache_key': cache_key,
            'message': 'Aggregates task has been queued. Check status using the task_id.'
        }, status=202)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@extend_schema(
    operation_id='check_task_status',
    summary='Check Task Status',
    description='Check the status of a background task',
    parameters=[
        OpenApiParameter(
            name='task_id',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description='Task ID to check',
            required=True
        )
    ],
    responses={
        200: OpenApiResponse(description='Task status retrieved successfully'),
        400: OpenApiResponse(description='Missing task_id'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def check_task_status(request):
    """Check the status of a Celery task"""
    try:
        task_id = request.GET.get('task_id')
        
        if not task_id:
            return Response({'error': 'task_id is required'}, status=400)
        
        task = AsyncResult(task_id)
        
        response = {
            'task_id': task_id,
            'state': task.state,
            'ready': task.ready(),
            'successful': task.successful() if task.ready() else None,
        }
        
        if task.state == 'PENDING':
            response['status'] = 'Task is waiting to be executed'
        elif task.state == 'STARTED':
            response['status'] = 'Task has started'
        elif task.state == 'PROGRESS':
            response['status'] = 'Task is in progress'
            response['meta'] = task.info
        elif task.state == 'SUCCESS':
            response['status'] = 'Task completed successfully'
            response['result'] = task.result
        elif task.state == 'FAILURE':
            response['status'] = 'Task failed'
            response['error'] = str(task.info)
        elif task.state == 'RETRY':
            response['status'] = 'Task is being retried'
            response['meta'] = task.info
        else:
            response['status'] = f'Unknown state: {task.state}'
        
        return Response(response, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@extend_schema(
    operation_id='list_active_tasks',
    summary='List Active Tasks',
    description='List all active Celery tasks',
    responses={
        200: OpenApiResponse(description='Active tasks retrieved successfully'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def list_active_tasks(request):
    """List all active tasks from Celery"""
    try:
        from philgeps_data_explorer.celery import app as celery_app
        
        # Get active tasks from all workers
        inspect = celery_app.control.inspect()
        active_tasks = inspect.active()
        scheduled_tasks = inspect.scheduled()
        reserved_tasks = inspect.reserved()
        
        return Response({
            'active': active_tasks or {},
            'scheduled': scheduled_tasks or {},
            'reserved': reserved_tasks or {},
            'total_active': sum(len(tasks) for tasks in (active_tasks or {}).values()),
            'total_scheduled': sum(len(tasks) for tasks in (scheduled_tasks or {}).values()),
            'total_reserved': sum(len(tasks) for tasks in (reserved_tasks or {}).values()),
        }, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@extend_schema(
    operation_id='cancel_task',
    summary='Cancel Task',
    description='Cancel a running or pending Celery task',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'task_id': {'type': 'string', 'description': 'Task ID to cancel'}
            },
            'required': ['task_id']
        }
    },
    responses={
        200: OpenApiResponse(description='Task cancelled successfully'),
        400: OpenApiResponse(description='Missing task_id'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def cancel_task(request):
    """Cancel a Celery task"""
    try:
        from philgeps_data_explorer.celery import app as celery_app
        
        task_id = request.data.get('task_id')
        
        if not task_id:
            return Response({'error': 'task_id is required'}, status=400)
        
        # Revoke the task
        celery_app.control.revoke(task_id, terminate=True)
        
        return Response({
            'status': 'cancelled',
            'task_id': task_id,
            'message': 'Task cancellation requested'
        }, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@extend_schema(
    operation_id='trigger_search',
    summary='Trigger Background Search Task',
    description='Trigger a background task for advanced search (chip-search) - always async for safety',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'filters': {
                    'type': 'object',
                    'description': 'Search filters (contractors, areas, organizations, business_categories, keywords, time_ranges, etc.)'
                }
            }
        }
    },
    responses={
        202: OpenApiResponse(description='Search task queued successfully'),
        200: OpenApiResponse(description='Results already cached'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def trigger_search(request):
    """Trigger a background search task - always async for safety with large datasets"""
    try:
        from .tasks import process_chip_search_task
        from django.core.cache import cache
        import hashlib
        
        filters = request.data.get('filters', {})
        
        # Generate cache key based on filters
        request_body = json.dumps(filters, sort_keys=True)
        cache_key = f"search:{hashlib.md5(request_body.encode()).hexdigest()}"
        
        # Check if result already exists in cache
        cached_result = cache.get(cache_key)
        if cached_result is not None and cached_result.get('status') != 'error':
            return Response({
                'status': 'cached',
                'data': cached_result,
                'message': 'Results already available in cache'
            }, status=200)
        
        # Queue the task
        task = process_chip_search_task.delay(filters, cache_key)
        
        return Response({
            'status': 'queued',
            'task_id': task.id,
            'cache_key': cache_key,
            'message': 'Search task has been queued. Check status using the task_id or poll with cache_key.'
        }, status=202)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@extend_schema(
    operation_id='trigger_analytics',
    summary='Trigger Background Analytics Task',
    description='Trigger a background task for analytics aggregates (charts) - always async for safety',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'filters': {
                    'type': 'object',
                    'description': 'Search filters for analytics computation'
                }
            }
        }
    },
    responses={
        202: OpenApiResponse(description='Analytics task queued successfully'),
        200: OpenApiResponse(description='Results already cached'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def trigger_analytics(request):
    """Trigger a background analytics computation task - always async for safety"""
    try:
        from .tasks import compute_chip_aggregates_task
        from django.core.cache import cache
        import hashlib
        
        filters = request.data.get('filters', {})
        
        # Generate cache key
        request_body = json.dumps(filters, sort_keys=True)
        cache_key = f"analytics:{hashlib.md5(request_body.encode()).hexdigest()}"
        
        # Check if result already exists in cache
        cached_result = cache.get(cache_key)
        if cached_result is not None and cached_result.get('status') != 'error':
            return Response({
                'status': 'cached',
                'data': cached_result,
                'message': 'Analytics results already available in cache'
            }, status=200)
        
        # Queue the task
        task = compute_chip_aggregates_task.delay(filters, cache_key)
        
        return Response({
            'status': 'queued',
            'task_id': task.id,
            'cache_key': cache_key,
            'message': 'Analytics task has been queued. Check status using the task_id or poll with cache_key.'
        }, status=202)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@extend_schema(
    operation_id='trigger_analytics_paginated',
    summary='Trigger Background Analytics Table Task',
    description='Trigger a background task for paginated analytics (analytics table) - always async for safety',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'filters': {
                    'type': 'object',
                    'description': 'Search filters for analytics computation'
                },
                'entity_type': {
                    'type': 'string',
                    'description': 'Entity type to aggregate (contractor, organization, area, category)'
                },
                'page': {
                    'type': 'integer',
                    'description': 'Page number'
                },
                'page_size': {
                    'type': 'integer',
                    'description': 'Number of entities per page'
                }
            }
        }
    },
    responses={
        202: OpenApiResponse(description='Analytics table task queued successfully'),
        200: OpenApiResponse(description='Results already cached'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def trigger_analytics_paginated(request):
    """Trigger a background analytics table computation task - always async for safety"""
    try:
        from .tasks import compute_chip_aggregates_paginated_task
        from django.core.cache import cache
        import hashlib
        
        filters = request.data.get('filters', {})
        entity_type = request.data.get('entity_type', 'contractor')
        page = request.data.get('page', 1)
        page_size = request.data.get('page_size', 20)
        
        # Generate cache key
        request_body = json.dumps({
            'filters': filters,
            'entity_type': entity_type,
            'page': page,
            'page_size': page_size
        }, sort_keys=True)
        cache_key = f"analytics_table:{hashlib.md5(request_body.encode()).hexdigest()}"
        
        # Check if result already exists in cache
        cached_result = cache.get(cache_key)
        if cached_result is not None and cached_result.get('status') != 'error':
            return Response({
                'status': 'cached',
                'data': cached_result,
                'message': 'Analytics table results already available in cache'
            }, status=200)
        
        # Queue the task
        task = compute_chip_aggregates_paginated_task.delay(filters, entity_type, page, page_size, cache_key)
        
        return Response({
            'status': 'queued',
            'task_id': task.id,
            'cache_key': cache_key,
            'message': 'Analytics table task has been queued. Check status using the task_id or poll with cache_key.'
        }, status=202)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@extend_schema(
    operation_id='get_cached_result',
    summary='Get Cached Result',
    description='Retrieve cached result by cache key',
    parameters=[
        OpenApiParameter(name='cache_key', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='Cache key returned from task submission'),
    ],
    responses={
        200: OpenApiResponse(description='Cached result retrieved successfully'),
        404: OpenApiResponse(description='Result not found in cache'),
        202: OpenApiResponse(description='Result not ready yet'),
        500: OpenApiResponse(description='Server error'),
    },
    tags=['data-processing']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_cached_result(request):
    """Get cached result by cache key - used to poll for task completion"""
    try:
        from django.core.cache import cache
        
        cache_key = request.GET.get('cache_key')
        
        if not cache_key:
            return Response({'error': 'cache_key is required'}, status=400)
        
        # Try to get result from cache
        result = cache.get(cache_key)
        
        if result is None:
            return Response({
                'status': 'not_ready',
                'message': 'Result not available yet. Task may still be processing.'
            }, status=202)
        
        if result.get('status') == 'error':
            return Response({
                'status': 'error',
                'error': result.get('message', 'Unknown error occurred')
            }, status=500)
        
        return Response({
            'status': 'success',
            'data': result,
            'message': 'Result retrieved from cache'
        }, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def benfords_law_analysis(request):
    """
    Analyze contract values using Benford's Law
    
    POST /api/data-processing/benfords-law/
    """
    try:
        from contracts.parquet_search import ParquetSearchService
        
        data = json.loads(request.body) if request.body else {}
        service = ParquetSearchService()
        
        result = service.analyze_benfords_law(
            contractors=data.get('contractors', []),
            areas=data.get('areas', []),
            organizations=data.get('organizations', []),
            business_categories=data.get('business_categories', []),
            keywords=data.get('keywords', []),
            time_ranges=data.get('time_ranges', []),
            value_range=data.get('value_range')
        )
        
        if not result.get('success'):
            return Response({
                'detail': result.get('error', 'Analysis failed')
            }, status=500)
        
        return Response(result, status=200)
        
    except Exception as e:
        return Response({'detail': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def rounding_patterns_analysis(request):
    """
    Analyze rounding patterns in contract values
    
    POST /api/data-processing/rounding-patterns/
    """
    try:
        from contracts.parquet_search import ParquetSearchService
        
        data = json.loads(request.body) if request.body else {}
        service = ParquetSearchService()
        
        result = service.analyze_rounding_patterns(
            contractors=data.get('contractors', []),
            areas=data.get('areas', []),
            organizations=data.get('organizations', []),
            business_categories=data.get('business_categories', []),
            keywords=data.get('keywords', []),
            time_ranges=data.get('time_ranges', []),
            value_range=data.get('value_range')
        )
        
        if not result.get('success'):
            return Response({
                'detail': result.get('error', 'Analysis failed')
            }, status=500)
        
        return Response(result, status=200)
        
    except Exception as e:
        return Response({'detail': str(e)}, status=500)