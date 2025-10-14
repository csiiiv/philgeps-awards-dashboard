"""
OpenAPI-compliant serializers for PHILGEPS API
These serializers are designed to work with Parquet data and provide proper OpenAPI documentation.
"""

from rest_framework import serializers
from decimal import Decimal
from datetime import date, datetime
from typing import List, Dict, Any, Optional


class TimeRangeSerializer(serializers.Serializer):
    """Serializer for time range objects in search requests"""
    type = serializers.ChoiceField(
        choices=['yearly', 'quarterly', 'custom'],
        help_text="Type of time range filter"
    )
    year = serializers.IntegerField(
        required=False,
        min_value=2013,
        max_value=2025,
        help_text="Year for yearly or quarterly filters"
    )
    quarter = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=4,
        help_text="Quarter number (1-4) for quarterly filters"
    )
    startDate = serializers.DateField(
        required=False,
        help_text="Start date for custom range (YYYY-MM-DD)"
    )
    endDate = serializers.DateField(
        required=False,
        help_text="End date for custom range (YYYY-MM-DD)"
    )

    def validate(self, data):
        """Validate time range based on type"""
        time_type = data.get('type')
        
        if time_type == 'yearly':
            if not data.get('year'):
                raise serializers.ValidationError("Year is required for yearly filter")
        elif time_type == 'quarterly':
            if not data.get('year') or not data.get('quarter'):
                raise serializers.ValidationError("Year and quarter are required for quarterly filter")
        elif time_type == 'custom':
            if not data.get('startDate') or not data.get('endDate'):
                raise serializers.ValidationError("Start and end dates are required for custom filter")
            if data.get('startDate') > data.get('endDate'):
                raise serializers.ValidationError("Start date must be before end date")
        
        return data


class ChipSearchRequestSerializer(serializers.Serializer):
    """Serializer for chip-based search requests"""
    contractors = serializers.ListField(
        child=serializers.CharField(max_length=500),
        required=False,
        default=list,
        help_text="List of contractor names to filter by"
    )
    areas = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        default=list,
        help_text="List of delivery areas to filter by"
    )
    organizations = serializers.ListField(
        child=serializers.CharField(max_length=500),
        required=False,
        default=list,
        help_text="List of organization names to filter by"
    )
    business_categories = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        default=list,
        help_text="List of business categories to filter by"
    )
    keywords = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        default=list,
        help_text="List of keywords to search for"
    )
    time_ranges = TimeRangeSerializer(
        many=True,
        required=False,
        default=list,
        help_text="List of time range filters"
    )
    page = serializers.IntegerField(
        required=False,
        default=1,
        min_value=1,
        help_text="Page number for pagination"
    )
    page_size = serializers.IntegerField(
        required=False,
        default=20,
        min_value=1,
        max_value=1000,
        help_text="Number of results per page (max 1000)"
    )
    # Allow sorting by a broader (but safe) set of fields. Use a CharField with explicit validation
    # against an allowlist to avoid injection or invalid SQL column names.
    ALLOWED_SORT_FIELDS = [
        'award_date', 'contract_amount', 'reference_id', 'created_at',
        'organization_name', 'awardee_name', 'business_category', 'area_of_delivery',
        'contract_no', 'award_status', 'award_amount', 'award_title', 'notice_title'
    ]

    sortBy = serializers.CharField(
        required=False,
        default='award_date',
        help_text="Field to sort by. Allowed: %s" % (', '.join(ALLOWED_SORT_FIELDS))
    )

    def validate_sortBy(self, value):
        # Normalize incoming value
        if not value:
            return value
        v = str(value).strip()
        if v in self.ALLOWED_SORT_FIELDS:
            return v
        raise serializers.ValidationError(f"Invalid sortBy '{v}'. Allowed fields: {', '.join(self.ALLOWED_SORT_FIELDS)}")
    sortDirection = serializers.ChoiceField(
        choices=['asc', 'desc'],
        required=False,
        default='desc',
        help_text="Sort direction"
    )
    include_flood_control = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Include Sumbong sa Pangulo dataset (2022-2025)"
    )
    value_range = serializers.DictField(
        required=False,
        default=None,
        help_text="Contract value range filter with min and max values"
    )


class ParquetContractSerializer(serializers.Serializer):
    """Serializer for contract data from Parquet files"""
    id = serializers.IntegerField(help_text="Unique contract identifier")
    reference_id = serializers.CharField(
        max_length=50,
        help_text="Contract reference ID"
    )
    notice_title = serializers.CharField(
        help_text="Title of the notice"
    )
    award_title = serializers.CharField(
        allow_blank=True,
        help_text="Title of the award"
    )
    organization_name = serializers.CharField(
        help_text="Name of the awarding organization"
    )
    awardee_name = serializers.CharField(
        help_text="Name of the awardee/contractor"
    )
    business_category = serializers.CharField(
        help_text="Business category of the contract"
    )
    area_of_delivery = serializers.CharField(
        help_text="Area where the contract will be delivered"
    )
    contract_amount = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        help_text="Total contract amount"
    )
    award_date = serializers.DateField(
        help_text="Date when the contract was awarded"
    )
    award_status = serializers.CharField(
        help_text="Status of the award"
    )
    contract_no = serializers.CharField(
        allow_blank=True,
        help_text="Contract number"
    )
    created_at = serializers.DateTimeField(
        help_text="When the record was created"
    )


class PaginationSerializer(serializers.Serializer):
    """Serializer for pagination metadata"""
    page = serializers.IntegerField(help_text="Current page number")
    page_size = serializers.IntegerField(help_text="Number of items per page")
    total_count = serializers.IntegerField(help_text="Total number of items")
    total_pages = serializers.IntegerField(help_text="Total number of pages")
    has_next = serializers.BooleanField(help_text="Whether there is a next page")
    has_previous = serializers.BooleanField(help_text="Whether there is a previous page")


class ContractSearchResponseSerializer(serializers.Serializer):
    """Serializer for contract search responses"""
    data = ParquetContractSerializer(many=True, help_text="List of contracts")
    pagination = PaginationSerializer(help_text="Pagination information")


class AggregationItemSerializer(serializers.Serializer):
    """Serializer for aggregation items"""
    label = serializers.CharField(help_text="Label for the aggregation")
    total_value = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        help_text="Total value"
    )
    count = serializers.IntegerField(help_text="Number of items")
    avg_value = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        required=False,
        help_text="Average value"
    )


class YearlyAggregationSerializer(serializers.Serializer):
    """Serializer for yearly aggregations"""
    year = serializers.IntegerField(help_text="Year")
    total_value = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        help_text="Total value for the year"
    )
    count = serializers.IntegerField(help_text="Number of contracts for the year")


class MonthlyAggregationSerializer(serializers.Serializer):
    """Serializer for monthly aggregations"""
    month = serializers.CharField(help_text="Month in YYYY-MM format")
    total_value = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        help_text="Total value for the month"
    )
    count = serializers.IntegerField(help_text="Number of contracts for the month")


class SummarySerializer(serializers.Serializer):
    """Serializer for summary statistics"""
    count = serializers.IntegerField(help_text="Total count")
    total_value = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        help_text="Total value"
    )
    avg_value = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        help_text="Average value"
    )


class AggregatesResponseSerializer(serializers.Serializer):
    """Serializer for aggregates response"""
    summary = SummarySerializer(many=True, help_text="Summary statistics")
    by_year = YearlyAggregationSerializer(many=True, help_text="Aggregations by year")
    by_month = MonthlyAggregationSerializer(many=True, help_text="Aggregations by month")
    by_contractor = AggregationItemSerializer(many=True, help_text="Aggregations by contractor")
    by_organization = AggregationItemSerializer(many=True, help_text="Aggregations by organization")
    by_area = AggregationItemSerializer(many=True, help_text="Aggregations by area")
    by_category = AggregationItemSerializer(many=True, help_text="Aggregations by category")


class PaginatedAggregatesRequestSerializer(ChipSearchRequestSerializer):
    """Serializer for paginated aggregates requests"""
    dimension = serializers.ChoiceField(
        choices=['by_contractor', 'by_organization', 'by_area', 'by_category'],
        required=False,
        default='by_contractor',
        help_text="Dimension to aggregate by"
    )
    sort_by = serializers.ChoiceField(
        choices=['total_value', 'count', 'avg_value', 'label'],
        required=False,
        default='total_value',
        help_text="Field to sort by"
    )
    sort_direction = serializers.ChoiceField(
        choices=['asc', 'desc'],
        required=False,
        default='desc',
        help_text="Sort direction"
    )


class PaginatedAggregatesResponseSerializer(serializers.Serializer):
    """Serializer for paginated aggregates response"""
    data = AggregationItemSerializer(many=True, help_text="List of aggregated items")
    pagination = PaginationSerializer(help_text="Pagination information")


class FilterOptionsSerializer(serializers.Serializer):
    """Serializer for filter options response"""
    contractors = serializers.ListField(
        child=serializers.CharField(),
        help_text="Available contractor names"
    )
    areas = serializers.ListField(
        child=serializers.CharField(),
        help_text="Available delivery areas"
    )
    organizations = serializers.ListField(
        child=serializers.CharField(),
        help_text="Available organization names"
    )
    business_categories = serializers.ListField(
        child=serializers.CharField(),
        help_text="Available business categories"
    )
    years = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="Available years"
    )


class ExportEstimateRequestSerializer(serializers.Serializer):
    """Serializer for export estimate requests"""
    contractors = serializers.ListField(
        child=serializers.CharField(max_length=500),
        required=False,
        default=list
    )
    areas = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        default=list
    )
    organizations = serializers.ListField(
        child=serializers.CharField(max_length=500),
        required=False,
        default=list
    )
    business_categories = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        default=list
    )
    keywords = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        default=list
    )
    time_ranges = TimeRangeSerializer(
        many=True,
        required=False,
        default=list
    )
    include_flood_control = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Whether to include flood control related contracts"
    )
    dimension = serializers.ChoiceField(
        choices=['by_contractor', 'by_organization', 'by_area', 'by_category'],
        required=False,
        default='by_contractor',
        help_text="Dimension for aggregated export"
    )


class AggregatedExportRequestSerializer(serializers.Serializer):
    """Serializer for aggregated export requests"""
    contractors = serializers.ListField(
        child=serializers.CharField(max_length=500),
        required=False,
        default=list,
        help_text="List of contractor names to filter by"
    )
    areas = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        default=list,
        help_text="List of delivery areas to filter by"
    )
    organizations = serializers.ListField(
        child=serializers.CharField(max_length=500),
        required=False,
        default=list,
        help_text="List of organization names to filter by"
    )
    business_categories = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        default=list,
        help_text="List of business categories to filter by"
    )
    keywords = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        default=list,
        help_text="List of keywords to search for"
    )
    time_ranges = TimeRangeSerializer(
        many=True,
        required=False,
        default=list,
        help_text="List of time range objects to filter by"
    )
    include_flood_control = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Whether to include flood control related contracts"
    )
    dimension = serializers.ChoiceField(
        choices=['by_contractor', 'by_organization', 'by_area', 'by_category'],
        required=True,
        help_text="Dimension for aggregated export (required)"
    )


class ExportEstimateResponseSerializer(serializers.Serializer):
    """Serializer for export estimate response"""
    total_count = serializers.IntegerField(help_text="Total number of records to export")
    estimated_csv_bytes = serializers.IntegerField(help_text="Estimated CSV file size in bytes")


class ErrorResponseSerializer(serializers.Serializer):
    """Serializer for error responses"""
    error = serializers.CharField(help_text="Error message")
    details = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Additional error details"
    )


class EntitySerializer(serializers.Serializer):
    """Serializer for entity responses (contractors, organizations, etc.)"""
    id = serializers.IntegerField(help_text="Unique identifier")
    name = serializers.CharField(help_text="Entity name")
    created_at = serializers.DateTimeField(help_text="Creation timestamp")


class EntityListResponseSerializer(serializers.Serializer):
    """Serializer for entity list responses"""
    count = serializers.IntegerField(help_text="Total number of entities")
    next = serializers.URLField(
        allow_null=True,
        help_text="URL for next page"
    )
    previous = serializers.URLField(
        allow_null=True,
        help_text="URL for previous page"
    )
    results = EntitySerializer(many=True, help_text="List of entities")
