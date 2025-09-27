from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import json

from .parquet_service import parquet_service

@api_view(['GET'])
@permission_classes([AllowAny])
def data_processing_home(request):
    """Basic data processing home view"""
    return Response({
        'message': 'Data Processing API is working',
        'status': 'success'
    })

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