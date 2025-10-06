from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Avg, Q, Min, Max
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
from django.http import StreamingHttpResponse
import re
from django.core.paginator import Paginator
import os
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.openapi import AutoSchema

from .models import Contract, Organization, Contractor, BusinessCategory, AreaOfDelivery, DataImport
from .serializers import (
    ContractListSerializer, ContractDetailSerializer, ContractCreateSerializer,
    OrganizationSerializer, ContractorSerializer, BusinessCategorySerializer,
    AreaOfDeliverySerializer, DataImportSerializer, ContractStatsSerializer
)
from .openapi_serializers import (
    ChipSearchRequestSerializer, ContractSearchResponseSerializer,
    AggregatesResponseSerializer, PaginatedAggregatesRequestSerializer,
    PaginatedAggregatesResponseSerializer, FilterOptionsSerializer,
    ExportEstimateRequestSerializer, ExportEstimateResponseSerializer,
    AggregatedExportRequestSerializer,
    ErrorResponseSerializer, EntityListResponseSerializer
)
from .exceptions import (
    ValidationError, SearchError, FilterOptionsError, ExportError,
    ParquetDataError, InvalidTimeRangeError, InvalidPageSizeError,
    InvalidSortFieldError, InvalidSortDirectionError
)
from .filters import ContractFilter
from .parquet_search import ParquetSearchService


class ContractViewSet(viewsets.ModelViewSet):
    """ViewSet for managing contracts"""
    queryset = Contract.objects.select_related(
        'organization', 'contractor', 'business_category', 'area_of_delivery'
    ).all()
    permission_classes = [AllowAny]  # Allow public access for search functionality
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ContractFilter
    search_fields = [
        'notice_title', 'award_title', 'reference_id', 'contract_no',
        'organization__name', 'contractor__name', 'business_category__name'
    ]
    ordering_fields = [
        'award_date', 'contract_amount', 'created_at', 'reference_id'
    ]
    ordering = ['-award_date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ContractListSerializer
        elif self.action == 'create':
            return ContractCreateSerializer
        return ContractDetailSerializer
    
    @action(detail=False, methods=['post'], url_path='advanced-search')
    def advanced_search(self, request):
        """
        Advanced search for contracts with multiple criteria using ALL parquet data
        """
        try:
            # Extract search parameters
            contractor = request.data.get('contractor', '').strip()
            area = request.data.get('area', '').strip()
            organization = request.data.get('organization', '').strip()
            business_category = request.data.get('business_category', '').strip()
            keywords = request.data.get('keywords', '').strip()
            time_range = request.data.get('time_range', {})
            page = int(request.data.get('page', 1))
            page_size = int(request.data.get('page_size', 20))
            sort_by = request.data.get('sortBy', 'award_date')
            sort_direction = request.data.get('sortDirection', 'desc')
            
            # Extract date range from time_range
            year_start = None
            year_end = None
            start_date = None
            end_date = None
            
            if isinstance(time_range, dict):
                if time_range.get('type') == 'yearly' and time_range.get('year'):
                    year_start = time_range.get('year')
                    year_end = time_range.get('year')
                elif time_range.get('type') == 'quarterly' and time_range.get('year'):
                    year_start = time_range.get('year')
                    year_end = time_range.get('year')
                elif time_range.get('type') == 'custom':
                    start_date = time_range.get('startDate')
                    end_date = time_range.get('endDate')
            
            # Use parquet search service to search ALL contracts
            parquet_service = ParquetSearchService()
            result = parquet_service.search_contracts(
                keywords=keywords,
                contractor=contractor,
                area=area,
                organization=organization,
                business_category=business_category,
                year_start=year_start,
                year_end=year_end,
                start_date=start_date,
                end_date=end_date,
                page=page,
                page_size=page_size,
                sort_by=sort_by,
                sort_direction=sort_direction
            )
            
            if result['success']:
                return Response({
                    'success': True,
                    'data': result['data'],
                    'pagination': result['pagination']
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Search failed'),
                    'data': [],
                    'pagination': result['pagination']
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'message': 'An error occurred during search'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @extend_schema(
        operation_id='contracts_chip_search',
        summary='Search contracts with filter chips',
        description='Advanced search with multiple values per filter type using AND/OR logic',
        request=ChipSearchRequestSerializer,
        responses={
            200: OpenApiResponse(
                response=ContractSearchResponseSerializer,
                description='Search results with pagination'
            ),
            400: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Validation error'
            ),
            500: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Internal server error'
            )
        },
        tags=['contracts']
    )
    @action(detail=False, methods=['post'], url_path='chip-search')
    def chip_search(self, request):
        """
        Advanced search with filter chips (multiple values per filter type)
        """
        try:
            # Validate request data
            serializer = ChipSearchRequestSerializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(detail=serializer.errors)
            
            validated_data = serializer.validated_data
            
            # Use parquet search service to search ALL contracts with chip logic
            parquet_service = ParquetSearchService()
            result = parquet_service.search_contracts_with_chips(
                contractors=validated_data.get('contractors', []),
                areas=validated_data.get('areas', []),
                organizations=validated_data.get('organizations', []),
                business_categories=validated_data.get('business_categories', []),
                keywords=validated_data.get('keywords', []),
                time_ranges=validated_data.get('time_ranges', []),
                page=validated_data.get('page', 1),
                page_size=validated_data.get('page_size', 20),
                sort_by=validated_data.get('sortBy', 'award_date'),
                sort_direction=validated_data.get('sortDirection', 'desc'),
                include_flood_control=validated_data.get('include_flood_control', False)
            )
            
            if result['success']:
                return Response({
                    'success': True,
                    'data': result['data'],
                    'pagination': result['pagination']
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Search failed'),
                    'data': [],
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except ValidationError:
            raise
        except SearchError:
            raise
        except Exception as e:
            raise SearchError(detail=f'An error occurred during search: {str(e)}')

    @extend_schema(
        operation_id='contracts_chip_aggregates',
        summary='Get analytics aggregates',
        description='Get aggregated data for charts and analytics using the same filter criteria as search',
        request=ChipSearchRequestSerializer,
        responses={
            200: OpenApiResponse(
                response=AggregatesResponseSerializer,
                description='Aggregated analytics data'
            ),
            400: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Validation error'
            ),
            500: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Internal server error'
            )
        },
        tags=['contracts']
    )
    @action(detail=False, methods=['post'], url_path='chip-aggregates')
    def chip_aggregates(self, request):
        """Aggregates for charts using same chip filters."""
        try:
            # Validate request data
            serializer = ChipSearchRequestSerializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(detail=serializer.errors)
            
            validated_data = serializer.validated_data
            topN = request.data.get('topN', 20)  # Additional parameter not in serializer

            parquet_service = ParquetSearchService()
            result = parquet_service.chip_aggregates(
                contractors=validated_data.get('contractors', []),
                areas=validated_data.get('areas', []),
                organizations=validated_data.get('organizations', []),
                business_categories=validated_data.get('business_categories', []),
                keywords=validated_data.get('keywords', []),
                time_ranges=validated_data.get('time_ranges', []),
                topN=topN,
                include_flood_control=validated_data.get('include_flood_control', False)
            )
            
            if result.get('success'):
                return Response({'data': result['data']}, status=status.HTTP_200_OK)
            else:
                raise SearchError(detail=result.get('error', 'Aggregation failed'))
                
        except ValidationError:
            raise
        except SearchError:
            raise
        except Exception as e:
            raise SearchError(detail=f'An error occurred during aggregation: {str(e)}')

    @extend_schema(
        operation_id='contracts_chip_aggregates_paginated',
        summary='Get paginated analytics aggregates',
        description='Get paginated aggregated data for analytics tables with sorting and filtering',
        request=PaginatedAggregatesRequestSerializer,
        responses={
            200: OpenApiResponse(
                response=PaginatedAggregatesResponseSerializer,
                description='Paginated aggregated analytics data'
            ),
            400: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Validation error'
            ),
            500: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Internal server error'
            )
        },
        tags=['contracts']
    )
    @action(detail=False, methods=['post'], url_path='chip-aggregates-paginated')
    def chip_aggregates_paginated(self, request):
        """Paginated aggregates for analytics table using chip filters."""
        try:
            # Debug logging
            print(f"DEBUG: Request data type: {type(request.data)}")
            print(f"DEBUG: Request data: {request.data}")
            
            # Validate request data
            serializer = PaginatedAggregatesRequestSerializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(detail=serializer.errors)
            
            validated_data = serializer.validated_data

            parquet_service = ParquetSearchService()
            result = parquet_service.chip_aggregates_paginated(
                contractors=validated_data.get('contractors', []),
                areas=validated_data.get('areas', []),
                organizations=validated_data.get('organizations', []),
                business_categories=validated_data.get('business_categories', []),
                keywords=validated_data.get('keywords', []),
                time_ranges=validated_data.get('time_ranges', []),
                page=validated_data.get('page', 1),
                page_size=validated_data.get('page_size', 20),
                dimension=validated_data.get('dimension', 'by_contractor'),
                sort_by=validated_data.get('sort_by', 'total_value'),
                sort_direction=validated_data.get('sort_direction', 'desc'),
                include_flood_control=validated_data.get('include_flood_control', False)
            )
            
            if result.get('success'):
                return Response({
                    'data': result['data'],
                    'pagination': result['pagination']
                }, status=status.HTTP_200_OK)
            else:
                raise SearchError(detail=result.get('error', 'Paginated aggregation failed'))
                
        except ValidationError:
            raise
        except SearchError:
            raise
        except Exception as e:
            raise SearchError(detail=f'An error occurred during paginated aggregation: {str(e)}')

    @extend_schema(
        operation_id='contracts_chip_export_estimate',
        summary='Estimate export size',
        description='Estimate the size of CSV export for current filters',
        request=ExportEstimateRequestSerializer,
        responses={
            200: OpenApiResponse(
                response=ExportEstimateResponseSerializer,
                description='Export size estimate'
            ),
            400: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Validation error'
            ),
            500: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Internal server error'
            )
        },
        tags=['export']
    )
    @action(detail=False, methods=['post'], url_path='chip-export-estimate')
    def chip_export_estimate(self, request):
        try:
            # Validate request data
            serializer = ExportEstimateRequestSerializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(detail=serializer.errors)
            
            validated_data = serializer.validated_data

            # For now, provide a simple estimate based on the full dataset
            # This avoids the performance issues with complex queries
            total = 4993608  # Total contracts in the dataset
            
            # Check if there are any filters applied
            has_filters = any([
                validated_data.get('contractors', []),
                validated_data.get('areas', []),
                validated_data.get('organizations', []),
                validated_data.get('business_categories', []),
                validated_data.get('keywords', []),
                validated_data.get('time_ranges', [])
            ])
            
            # If filters are applied, estimate a smaller subset
            if has_filters:
                # Conservative estimate: assume filters reduce results by 50-90%
                total = int(total * 0.3)  # Assume 30% of data matches filters
            
            # Estimate CSV size based on average row size
            # Based on the data structure, each row is approximately 200-300 bytes
            avg_row_bytes = 250
            estimated_bytes = total * avg_row_bytes
            
            return Response({
                'total_count': total, 
                'estimated_csv_bytes': estimated_bytes
            }, status=status.HTTP_200_OK)
            
        except ValidationError:
            raise
        except Exception as e:
            raise ExportError(detail=f'An error occurred during export estimation: {str(e)}')
    
    @extend_schema(
        operation_id='contracts_chip_export_aggregated_estimate',
        summary='Estimate aggregated export size',
        description='Estimate the size of aggregated CSV export for analytics data',
        request=AggregatedExportRequestSerializer,
        responses={
            200: OpenApiResponse(
                response=ExportEstimateResponseSerializer,
                description='Aggregated export size estimate'
            ),
            400: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Validation error'
            ),
            500: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Internal server error'
            )
        },
        tags=['export']
    )
    @action(detail=False, methods=['post'], url_path='chip-export-aggregated-estimate')
    def chip_export_aggregated_estimate(self, request):
        try:
            # Validate request data
            serializer = AggregatedExportRequestSerializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(detail=serializer.errors)
            
            validated_data = serializer.validated_data
            dimension = validated_data.get('dimension', 'by_contractor')
            
            # Get actual count from the aggregated data
            parquet_service = ParquetSearchService()
            
            # Get a small sample to estimate total count
            result = parquet_service.chip_aggregates_paginated(
                contractors=validated_data.get('contractors', []),
                areas=validated_data.get('areas', []),
                organizations=validated_data.get('organizations', []),
                business_categories=validated_data.get('business_categories', []),
                keywords=validated_data.get('keywords', []),
                time_ranges=validated_data.get('time_ranges', []),
                dimension=dimension,
                page=1,
                page_size=1,
                sort_by='total_value',
                sort_direction='desc',
                include_flood_control=validated_data.get('include_flood_control', False)
            )
            
            # Get total count from pagination info
            total_count = result.get('pagination', {}).get('total_count', 0)
            
            # Estimate CSV size based on aggregated data structure
            # Each row: label,total_value,count,avg_value (approximately 100-150 bytes)
            avg_row_bytes = 120
            estimated_bytes = total_count * avg_row_bytes
            
            return Response({
                'total_count': total_count, 
                'estimated_csv_bytes': estimated_bytes
            }, status=status.HTTP_200_OK)
            
        except ValidationError:
            raise
        except Exception as e:
            raise ExportError(detail=f'An error occurred during aggregated export estimation: {str(e)}')
    
    @extend_schema(
        operation_id='contracts_chip_export',
        summary='Export CSV data',
        description='Stream full CSV export for current filters',
        request=ExportEstimateRequestSerializer,
        responses={
            200: OpenApiResponse(
                description='CSV file download'
            ),
            400: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Validation error'
            ),
            500: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Internal server error'
            )
        },
        tags=['export']
    )
    @action(detail=False, methods=['post'], url_path='chip-export')
    def chip_export(self, request):
        try:
            # Validate request data
            serializer = ExportEstimateRequestSerializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(detail=serializer.errors)
            
            validated_data = serializer.validated_data

            parquet_service = ParquetSearchService()
            headers = [
                'reference_id','contract_no','award_title','notice_title','awardee_name',
                'organization_name','area_of_delivery','business_category','contract_amount','award_date','award_status'
            ]
            def esc(v):
                s = '' if v is None else str(v)
                s = s.replace('"','""')
                return f'"{s}"' if (',' in s or '"' in s or '\n' in s) else s
            def row_to_csv(r):
                vals = [
                    r.get('reference_id') or '',
                    r.get('contract_no') or '',
                    r.get('award_title') or '',
                    r.get('notice_title') or '',
                    r.get('awardee_name') or '',
                    r.get('organization_name') or '',
                    r.get('area_of_delivery') or '',
                    r.get('business_category') or '',
                    r.get('contract_amount') or '',
                    r.get('award_date') or '',
                    r.get('award_status') or ''
                ]
                return ','.join(esc(v) for v in vals)

            def generate():
                yield ','.join(headers) + '\n'
                page = 1
                page_size = 1000
                while True:
                    result = parquet_service.search_contracts_with_chips(
                        contractors=validated_data.get('contractors', []),
                        areas=validated_data.get('areas', []),
                        organizations=validated_data.get('organizations', []),
                        business_categories=validated_data.get('business_categories', []),
                        keywords=validated_data.get('keywords', []),
                        time_ranges=validated_data.get('time_ranges', []),
                        page=page,
                        page_size=page_size,
                        sort_by='award_date',
                        sort_direction='desc'
                    )
                    rows = result.get('data', [])
                    if not rows:
                        break
                    for r in rows:
                        yield row_to_csv(r) + '\n'
                    if len(rows) < page_size:
                        break
                    page += 1

            response = StreamingHttpResponse(generate(), content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="contracts_export.csv"'
            return response
        except ValidationError:
            raise
        except Exception as e:
            raise ExportError(detail=f'An error occurred during CSV export: {str(e)}')
    
    @extend_schema(
        operation_id='contracts_chip_export_aggregated',
        summary='Export aggregated CSV data',
        description='Stream aggregated CSV export for analytics data (contractors, organizations, etc.)',
        request=AggregatedExportRequestSerializer,
        responses={
            200: OpenApiResponse(
                description='CSV file download'
            ),
            400: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Validation error'
            ),
            500: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Internal server error'
            )
        },
        tags=['export']
    )
    @action(detail=False, methods=['post'], url_path='chip-export-aggregated')
    def chip_export_aggregated(self, request):
        try:
            # Validate request data
            serializer = AggregatedExportRequestSerializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(detail=serializer.errors)
            
            validated_data = serializer.validated_data
            
            # Get dimension from request data (default to contractor)
            dimension = validated_data.get('dimension', 'by_contractor')
            
            parquet_service = ParquetSearchService()
            
            # Headers for aggregated data
            headers = ['label', 'total_value', 'count', 'avg_value']
            
            def esc(v):
                s = '' if v is None else str(v)
                s = s.replace('"','""')
                return f'"{s}"' if (',' in s or '"' in s or '\n' in s) else s
            
            def row_to_csv(r):
                vals = [
                    r.get('label') or '',
                    r.get('total_value') or '',
                    r.get('count') or '',
                    r.get('avg_value') or ''
                ]
                return ','.join(esc(v) for v in vals)

            def generate():
                yield ','.join(headers) + '\n'
                page = 1
                page_size = 1000
                while True:
                    result = parquet_service.chip_aggregates_paginated(
                        contractors=validated_data.get('contractors', []),
                        areas=validated_data.get('areas', []),
                        organizations=validated_data.get('organizations', []),
                        business_categories=validated_data.get('business_categories', []),
                        keywords=validated_data.get('keywords', []),
                        time_ranges=validated_data.get('time_ranges', []),
                        dimension=dimension,
                        page=page,
                        page_size=page_size,
                        sort_by='total_value',
                        sort_direction='desc',
                        include_flood_control=validated_data.get('include_flood_control', False)
                    )
                    rows = result.get('data', [])
                    if not rows:
                        break
                    for r in rows:
                        yield row_to_csv(r) + '\n'
                    if len(rows) < page_size:
                        break
                    page += 1

            response = StreamingHttpResponse(generate(), content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{dimension.replace("by_", "")}_export.csv"'
            return response
        except ValidationError:
            raise
        except Exception as e:
            raise ExportError(detail=f'An error occurred during aggregated CSV export: {str(e)}')
    
    @extend_schema(
        operation_id='contracts_filter_options',
        summary='Get filter options',
        description='Get all available filter options for dropdowns and autocomplete',
        responses={
            200: OpenApiResponse(
                response=FilterOptionsSerializer,
                description='Available filter options'
            ),
            500: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Internal server error'
            )
        },
        tags=['contracts']
    )
    @action(detail=False, methods=['get'], url_path='filter-options')
    def filter_options(self, request):
        """
        Get filter options for advanced search dropdowns from ALL parquet data
        """
        try:
            # Use parquet search service to get filter options from ALL data
            parquet_service = ParquetSearchService()
            filter_options = parquet_service.get_filter_options()
            
            return Response(filter_options, status=status.HTTP_200_OK)
            
        except Exception as e:
            raise FilterOptionsError(detail=f'Failed to load filter options: {str(e)}')


class OrganizationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for organizations"""
    queryset = Organization.objects.prefetch_related('contracts').all()
    serializer_class = OrganizationSerializer
    permission_classes = [AllowAny]  # Allow public access for search functionality
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @extend_schema(
        operation_id='organizations_list',
        summary='Search organizations',
        description='Search organizations with substring or exact word matching',
        parameters=[
            OpenApiParameter(
                name='search',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Substring search (e.g., "petron" matches "PETRON CORPORATION")'
            ),
            OpenApiParameter(
                name='word',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Exact word search (e.g., "deo" won\'t match "montevideo")'
            ),
            OpenApiParameter(
                name='page_size',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Results per page (default: 20)'
            )
        ],
        responses={
            200: OpenApiResponse(
                response=EntityListResponseSerializer,
                description='List of organizations'
            ),
            500: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Internal server error'
            )
        },
        tags=['entities']
    )
    def list(self, request, *args, **kwargs):
        word = request.query_params.get('word', '').strip()
        if not word:
            return super().list(request, *args, **kwargs)

        # Prefilter in DB, refine in Python for whole-word match
        base = self.get_queryset().filter(name__icontains=word).values('id', 'name')
        word_pattern = re.compile(rf'(?i)(^|\W){re.escape(word)}($|\W)')
        matched_ids = [row['id'] for row in base if word_pattern.search(row['name'] or '')]

        qs = self.get_queryset().filter(id__in=matched_ids).order_by('name')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class ContractorViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for contractors"""
    queryset = Contractor.objects.prefetch_related('contracts').all()
    serializer_class = ContractorSerializer
    permission_classes = [AllowAny]  # Allow public access for search functionality
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @extend_schema(
        operation_id='contractors_list',
        summary='Search contractors',
        description='Search contractors with substring or exact word matching',
        parameters=[
            OpenApiParameter(
                name='search',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Substring search (e.g., "petron" matches "PETRON CORPORATION")'
            ),
            OpenApiParameter(
                name='word',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Exact word search (e.g., "deo" won\'t match "montevideo")'
            ),
            OpenApiParameter(
                name='page_size',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Results per page (default: 20)'
            )
        ],
        responses={
            200: OpenApiResponse(
                response=EntityListResponseSerializer,
                description='List of contractors'
            ),
            500: OpenApiResponse(
                response=ErrorResponseSerializer,
                description='Internal server error'
            )
        },
        tags=['entities']
    )
    def list(self, request, *args, **kwargs):
        word = request.query_params.get('word', '').strip()
        if not word:
            return super().list(request, *args, **kwargs)

        base = self.get_queryset().filter(name__icontains=word).values('id', 'name')
        word_pattern = re.compile(rf'(?i)(^|\W){re.escape(word)}($|\W)')
        matched_ids = [row['id'] for row in base if word_pattern.search(row['name'] or '')]

        qs = self.get_queryset().filter(id__in=matched_ids).order_by('name')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class BusinessCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for business categories"""
    queryset = BusinessCategory.objects.prefetch_related('contracts').all()
    serializer_class = BusinessCategorySerializer
    permission_classes = [AllowAny]  # Allow public access for search functionality
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @extend_schema(
        operation_id='business_categories_list',
        summary='Search business categories',
        description='Search business categories with substring or exact word matching',
        parameters=[
            OpenApiParameter(name='search', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='word', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='page_size', type=OpenApiTypes.INT, location=OpenApiParameter.QUERY)
        ],
        responses={200: OpenApiResponse(response=EntityListResponseSerializer), 500: OpenApiResponse(response=ErrorResponseSerializer)},
        tags=['entities']
    )
    def list(self, request, *args, **kwargs):
        word = request.query_params.get('word', '').strip()
        if not word:
            return super().list(request, *args, **kwargs)

        base = self.get_queryset().filter(name__icontains=word).values('id', 'name')
        word_pattern = re.compile(rf'(?i)(^|\W){re.escape(word)}($|\W)')
        matched_ids = [row['id'] for row in base if word_pattern.search(row['name'] or '')]

        qs = self.get_queryset().filter(id__in=matched_ids).order_by('name')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class AreaOfDeliveryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for areas of delivery"""
    queryset = AreaOfDelivery.objects.prefetch_related('contracts').all()
    serializer_class = AreaOfDeliverySerializer
    permission_classes = [AllowAny]  # Allow public access for search functionality
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @extend_schema(
        operation_id='areas_of_delivery_list',
        summary='Search areas of delivery',
        description='Search delivery areas with substring or exact word matching',
        parameters=[
            OpenApiParameter(name='search', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='word', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='page_size', type=OpenApiTypes.INT, location=OpenApiParameter.QUERY)
        ],
        responses={200: OpenApiResponse(response=EntityListResponseSerializer), 500: OpenApiResponse(response=ErrorResponseSerializer)},
        tags=['entities']
    )
    def list(self, request, *args, **kwargs):
        word = request.query_params.get('word', '').strip()
        if not word:
            return super().list(request, *args, **kwargs)

        base = self.get_queryset().filter(name__icontains=word).values('id', 'name')
        word_pattern = re.compile(rf'(?i)(^|\W){re.escape(word)}($|\W)')
        matched_ids = [row['id'] for row in base if word_pattern.search(row['name'] or '')]

        qs = self.get_queryset().filter(id__in=matched_ids).order_by('name')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class DataImportViewSet(viewsets.ModelViewSet):
    """ViewSet for data imports"""
    queryset = DataImport.objects.all()
    serializer_class = DataImportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['started_at', 'status']
    ordering = ['-started_at']