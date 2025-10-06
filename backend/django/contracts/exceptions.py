"""
Custom exceptions for PHILGEPS API
These exceptions provide proper HTTP status codes and error handling for OpenAPI compliance.
"""

from rest_framework import status
from rest_framework.exceptions import APIException


class ValidationError(APIException):
    """Exception for validation errors"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Validation failed'
    default_code = 'validation_error'


class SearchError(APIException):
    """Exception for search-related errors"""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Search operation failed'
    default_code = 'search_error'


class FilterOptionsError(APIException):
    """Exception for filter options errors"""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Failed to load filter options'
    default_code = 'filter_options_error'


class ExportError(APIException):
    """Exception for export-related errors"""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Export operation failed'
    default_code = 'export_error'


class ParquetDataError(APIException):
    """Exception for Parquet data processing errors"""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Parquet data processing failed'
    default_code = 'parquet_data_error'


class InvalidTimeRangeError(ValidationError):
    """Exception for invalid time range parameters"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid time range parameters'
    default_code = 'invalid_time_range'


class InvalidPageSizeError(ValidationError):
    """Exception for invalid page size"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Page size must be between 1 and 100'
    default_code = 'invalid_page_size'


class InvalidSortFieldError(ValidationError):
    """Exception for invalid sort field"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid sort field'
    default_code = 'invalid_sort_field'


class InvalidSortDirectionError(ValidationError):
    """Exception for invalid sort direction"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Sort direction must be "asc" or "desc"'
    default_code = 'invalid_sort_direction'
