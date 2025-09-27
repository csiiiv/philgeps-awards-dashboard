import django_filters
from django.db.models import Q
from .models import Contract, Organization, Contractor, BusinessCategory, AreaOfDelivery


class ContractFilter(django_filters.FilterSet):
    """Filter for contracts"""
    
    # Date filters
    award_date_from = django_filters.DateFilter(field_name='award_date', lookup_expr='gte')
    award_date_to = django_filters.DateFilter(field_name='award_date', lookup_expr='lte')
    publish_date_from = django_filters.DateFilter(field_name='publish_date', lookup_expr='gte')
    publish_date_to = django_filters.DateFilter(field_name='publish_date', lookup_expr='lte')
    
    # Amount filters
    min_amount = django_filters.NumberFilter(field_name='total_contract_amount', lookup_expr='gte')
    max_amount = django_filters.NumberFilter(field_name='total_contract_amount', lookup_expr='lte')
    
    # Text filters
    organization = django_filters.CharFilter(field_name='organization__name', lookup_expr='icontains')
    contractor = django_filters.CharFilter(field_name='contractor__name', lookup_expr='icontains')
    business_category = django_filters.CharFilter(field_name='business_category__name', lookup_expr='icontains')
    area_of_delivery = django_filters.CharFilter(field_name='area_of_delivery__name', lookup_expr='icontains')
    
    # Status filters
    award_status = django_filters.CharFilter(field_name='award_status', lookup_expr='icontains')
    notice_status = django_filters.CharFilter(field_name='notice_status', lookup_expr='icontains')
    
    # Classification filters
    classification = django_filters.CharFilter(field_name='classification', lookup_expr='icontains')
    notice_type = django_filters.CharFilter(field_name='notice_type', lookup_expr='icontains')
    procurement_mode = django_filters.CharFilter(field_name='procurement_mode', lookup_expr='icontains')
    
    # Boolean filters
    is_awarded = django_filters.BooleanFilter(method='filter_is_awarded')
    
    class Meta:
        model = Contract
        fields = [
            'award_date_from', 'award_date_to', 'publish_date_from', 'publish_date_to',
            'min_amount', 'max_amount', 'organization', 'contractor', 'business_category',
            'area_of_delivery', 'award_status', 'notice_status', 'classification',
            'notice_type', 'procurement_mode', 'is_awarded'
        ]
    
    def filter_is_awarded(self, queryset, name, value):
        """Filter for awarded contracts"""
        if value is True:
            return queryset.filter(award_status__icontains='awarded')
        elif value is False:
            return queryset.exclude(award_status__icontains='awarded')
        return queryset
