from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
import json

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