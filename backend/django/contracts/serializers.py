from rest_framework import serializers
from django.db import models
from drf_spectacular.utils import extend_schema_field
from .models import Contract, Organization, Contractor, BusinessCategory, AreaOfDelivery, DataImport


class OrganizationSerializer(serializers.ModelSerializer):
    contract_count = serializers.SerializerMethodField()
    total_contract_value = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'contract_count', 'total_contract_value',
            'created_at', 'updated_at'
        ]
    
    @extend_schema_field(serializers.IntegerField)
    def get_contract_count(self, obj) -> int:
        return obj.contracts.count()
    
    @extend_schema_field(serializers.DecimalField(max_digits=15, decimal_places=2))
    def get_total_contract_value(self, obj) -> float:
        total = obj.contracts.aggregate(
            total=models.Sum('total_contract_amount')
        )['total']
        return float(total or 0)


class ContractorSerializer(serializers.ModelSerializer):
    contract_count = serializers.SerializerMethodField()
    total_contract_value = serializers.SerializerMethodField()
    business_categories_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Contractor
        fields = [
            'id', 'name', 'contract_count', 'total_contract_value',
            'business_categories_count', 'created_at', 'updated_at'
        ]
    
    @extend_schema_field(serializers.IntegerField)
    def get_contract_count(self, obj) -> int:
        return obj.contracts.count()
    
    @extend_schema_field(serializers.DecimalField(max_digits=15, decimal_places=2))
    def get_total_contract_value(self, obj) -> float:
        total = obj.contracts.aggregate(
            total=models.Sum('total_contract_amount')
        )['total']
        return float(total or 0)
    
    @extend_schema_field(serializers.IntegerField)
    def get_business_categories_count(self, obj) -> int:
        return obj.contracts.values('business_category').distinct().count()


class BusinessCategorySerializer(serializers.ModelSerializer):
    contract_count = serializers.SerializerMethodField()
    total_contract_value = serializers.SerializerMethodField()
    contractor_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BusinessCategory
        fields = [
            'id', 'name', 'contract_count', 'total_contract_value',
            'contractor_count', 'created_at', 'updated_at'
        ]
    
    @extend_schema_field(serializers.IntegerField)
    def get_contract_count(self, obj) -> int:
        return obj.contracts.count()
    
    @extend_schema_field(serializers.DecimalField(max_digits=15, decimal_places=2))
    def get_total_contract_value(self, obj) -> float:
        total = obj.contracts.aggregate(
            total=models.Sum('total_contract_amount')
        )['total']
        return float(total or 0)
    
    @extend_schema_field(serializers.IntegerField)
    def get_contractor_count(self, obj) -> int:
        return obj.contracts.values('contractor').distinct().count()


class AreaOfDeliverySerializer(serializers.ModelSerializer):
    contract_count = serializers.SerializerMethodField()
    total_contract_value = serializers.SerializerMethodField()
    
    class Meta:
        model = AreaOfDelivery
        fields = [
            'id', 'name', 'contract_count', 'total_contract_value',
            'created_at', 'updated_at'
        ]
    
    @extend_schema_field(serializers.IntegerField)
    def get_contract_count(self, obj) -> int:
        return obj.contracts.count()
    
    @extend_schema_field(serializers.DecimalField(max_digits=15, decimal_places=2))
    def get_total_contract_value(self, obj) -> float:
        total = obj.contracts.aggregate(
            total=models.Sum('total_contract_amount')
        )['total']
        return float(total or 0)


class ContractListSerializer(serializers.ModelSerializer):
    """Serializer for contract list views (optimized for performance)"""
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    contractor_name = serializers.CharField(source='contractor.name', read_only=True)
    business_category_name = serializers.CharField(source='business_category.name', read_only=True)
    area_of_delivery_name = serializers.CharField(source='area_of_delivery.name', read_only=True)
    
    class Meta:
        model = Contract
        fields = [
            'id', 'reference_id', 'notice_title', 'award_title',
            'organization_name', 'contractor_name', 'business_category_name',
            'area_of_delivery_name', 'total_contract_amount', 'award_date',
            'award_status', 'contract_no', 'created_at'
        ]


class ContractDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed contract views"""
    organization = OrganizationSerializer(read_only=True)
    contractor = ContractorSerializer(read_only=True)
    business_category = BusinessCategorySerializer(read_only=True)
    area_of_delivery = AreaOfDeliverySerializer(read_only=True)
    is_awarded = serializers.SerializerMethodField()
    contract_value_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Contract
        fields = [
            'id', 'reference_id', 'notice_title', 'award_title',
            'publish_date', 'award_date', 'award_publish_date',
            'notice_to_proceed_date', 'contract_effectivity_date',
            'contract_end_date', 'prebid_date', 'closing_date',
            'classification', 'notice_type', 'award_type',
            'total_contract_amount', 'average_line_item_amount',
            'min_line_item_amount', 'max_line_item_amount',
            'line_item_count', 'total_quantity',
            'notice_status', 'award_status', 'award_no', 'contract_no',
            'funding_source', 'funding_instrument', 'procurement_mode',
            'trade_agreement', 'contract_duration', 'calendar_type',
            'reason_for_award', 'organization', 'contractor',
            'business_category', 'area_of_delivery', 'is_awarded',
            'contract_value_formatted', 'created_at', 'updated_at'
        ]
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_awarded(self, obj) -> bool:
        return obj.is_awarded()
    
    @extend_schema_field(serializers.CharField)
    def get_contract_value_formatted(self, obj) -> str:
        return obj.contract_value_formatted


class ContractCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating contracts"""
    organization_name = serializers.CharField(write_only=True)
    contractor_name = serializers.CharField(write_only=True)
    business_category_name = serializers.CharField(write_only=True)
    area_of_delivery_name = serializers.CharField(write_only=True)
    
    class Meta:
        model = Contract
        fields = [
            'reference_id', 'notice_title', 'award_title',
            'publish_date', 'award_date', 'award_publish_date',
            'notice_to_proceed_date', 'contract_effectivity_date',
            'contract_end_date', 'prebid_date', 'closing_date',
            'classification', 'notice_type', 'award_type',
            'total_contract_amount', 'average_line_item_amount',
            'min_line_item_amount', 'max_line_item_amount',
            'line_item_count', 'total_quantity',
            'notice_status', 'award_status', 'award_no', 'contract_no',
            'funding_source', 'funding_instrument', 'procurement_mode',
            'trade_agreement', 'contract_duration', 'calendar_type',
            'reason_for_award', 'organization_name', 'contractor_name',
            'business_category_name', 'area_of_delivery_name'
        ]
    
    def create(self, validated_data):
        # Extract related object names
        org_name = validated_data.pop('organization_name')
        contractor_name = validated_data.pop('contractor_name')
        category_name = validated_data.pop('business_category_name')
        area_name = validated_data.pop('area_of_delivery_name')
        
        # Get or create related objects
        organization, _ = Organization.objects.get_or_create(name=org_name)
        contractor, _ = Contractor.objects.get_or_create(name=contractor_name)
        business_category, _ = BusinessCategory.objects.get_or_create(name=category_name)
        area_of_delivery, _ = AreaOfDelivery.objects.get_or_create(name=area_name)
        
        # Create contract
        contract = Contract.objects.create(
            organization=organization,
            contractor=contractor,
            business_category=business_category,
            area_of_delivery=area_of_delivery,
            **validated_data
        )
        
        return contract


class DataImportSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = DataImport
        fields = [
            'id', 'filename', 'file_path', 'import_type', 'status',
            'total_records', 'processed_records', 'failed_records',
            'progress_percentage', 'error_message', 'error_details',
            'started_at', 'completed_at', 'duration', 'created_by'
        ]
        read_only_fields = [
            'processed_records', 'failed_records', 'progress_percentage',
            'error_message', 'error_details', 'completed_at', 'duration'
        ]
    
    @extend_schema_field(serializers.FloatField)
    def get_progress_percentage(self, obj) -> float:
        return obj.progress_percentage()
    
    @extend_schema_field(serializers.DurationField)
    def get_duration(self, obj) -> str:
        duration = obj.duration
        return str(duration) if duration else None


class ContractStatsSerializer(serializers.Serializer):
    """Serializer for contract statistics"""
    total_contracts = serializers.IntegerField()
    total_contract_value = serializers.DecimalField(max_digits=20, decimal_places=2)
    average_contract_value = serializers.DecimalField(max_digits=20, decimal_places=2)
    unique_contractors = serializers.IntegerField()
    unique_organizations = serializers.IntegerField()
    unique_categories = serializers.IntegerField()
    date_range = serializers.DictField()
    top_contractors = serializers.ListField()
    top_organizations = serializers.ListField()
    top_categories = serializers.ListField()
