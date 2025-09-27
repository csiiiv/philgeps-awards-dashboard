from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal


class Organization(models.Model):
    """Government organizations that award contracts"""
    name = models.CharField(max_length=500, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'
    
    def __str__(self):
        return self.name


class Contractor(models.Model):
    """Contractors who receive contracts"""
    name = models.CharField(max_length=500, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Contractor'
        verbose_name_plural = 'Contractors'
    
    def __str__(self):
        return self.name


class BusinessCategory(models.Model):
    """Business categories for contracts"""
    name = models.CharField(max_length=200, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Business Category'
        verbose_name_plural = 'Business Categories'
    
    def __str__(self):
        return self.name


class AreaOfDelivery(models.Model):
    """Areas where contracts are delivered"""
    name = models.CharField(max_length=200, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Area of Delivery'
        verbose_name_plural = 'Areas of Delivery'
    
    def __str__(self):
        return self.name


class Contract(models.Model):
    """Main contract model"""
    
    # Basic contract information
    reference_id = models.CharField(max_length=50, unique=True, db_index=True)
    notice_title = models.TextField()
    award_title = models.TextField(blank=True, null=True)
    
    # Dates
    publish_date = models.DateField(null=True, blank=True)
    award_date = models.DateField(null=True, blank=True)
    award_publish_date = models.DateField(null=True, blank=True)
    notice_to_proceed_date = models.DateField(null=True, blank=True)
    contract_effectivity_date = models.DateField(null=True, blank=True)
    contract_end_date = models.DateField(null=True, blank=True)
    prebid_date = models.DateTimeField(null=True, blank=True)
    closing_date = models.DateTimeField(null=True, blank=True)
    
    # Classification
    classification = models.CharField(max_length=100, blank=True, null=True)
    notice_type = models.CharField(max_length=100, blank=True, null=True)
    award_type = models.CharField(max_length=100, blank=True, null=True)
    
    # Financial information
    total_contract_amount = models.DecimalField(
        max_digits=20, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    average_line_item_amount = models.DecimalField(
        max_digits=20, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    min_line_item_amount = models.DecimalField(
        max_digits=20, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    max_line_item_amount = models.DecimalField(
        max_digits=20, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Quantities
    line_item_count = models.PositiveIntegerField(null=True, blank=True)
    total_quantity = models.DecimalField(
        max_digits=20, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Status and identifiers
    notice_status = models.CharField(max_length=100, blank=True, null=True)
    award_status = models.CharField(max_length=100, blank=True, null=True)
    award_no = models.CharField(max_length=100, blank=True, null=True)
    contract_no = models.CharField(max_length=100, blank=True, null=True)
    
    # Procurement details
    funding_source = models.CharField(max_length=200, blank=True, null=True)
    funding_instrument = models.CharField(max_length=200, blank=True, null=True)
    procurement_mode = models.CharField(max_length=100, blank=True, null=True)
    trade_agreement = models.CharField(max_length=100, blank=True, null=True)
    contract_duration = models.CharField(max_length=100, blank=True, null=True)
    calendar_type = models.CharField(max_length=50, blank=True, null=True)
    reason_for_award = models.TextField(blank=True, null=True)
    
    # Foreign keys
    organization = models.ForeignKey(
        Organization, 
        on_delete=models.CASCADE, 
        related_name='contracts'
    )
    contractor = models.ForeignKey(
        Contractor, 
        on_delete=models.CASCADE, 
        related_name='contracts'
    )
    business_category = models.ForeignKey(
        BusinessCategory, 
        on_delete=models.CASCADE, 
        related_name='contracts'
    )
    area_of_delivery = models.ForeignKey(
        AreaOfDelivery, 
        on_delete=models.CASCADE, 
        related_name='contracts'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_contracts'
    )
    
    class Meta:
        ordering = ['-award_date', '-total_contract_amount']
        indexes = [
            models.Index(fields=['award_date']),
            models.Index(fields=['total_contract_amount']),
            models.Index(fields=['organization', 'award_date']),
            models.Index(fields=['contractor', 'award_date']),
            models.Index(fields=['business_category', 'award_date']),
        ]
        verbose_name = 'Contract'
        verbose_name_plural = 'Contracts'
    
    def __str__(self):
        return f"{self.reference_id} - {self.notice_title[:50]}..."
    
    @property
    def is_awarded(self):
        """Check if contract is awarded"""
        return self.award_status and 'awarded' in self.award_status.lower()
    
    @property
    def contract_value_formatted(self):
        """Format contract value for display"""
        if self.total_contract_amount:
            return f"₱{self.total_contract_amount:,.2f}"
        return "N/A"


class DataImport(models.Model):
    """Track data imports"""
    
    IMPORT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    IMPORT_TYPE_CHOICES = [
        ('xlsx', 'Excel File'),
        ('parquet', 'Parquet File'),
        ('csv', 'CSV File'),
    ]
    
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    import_type = models.CharField(max_length=20, choices=IMPORT_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=IMPORT_STATUS_CHOICES, default='pending')
    
    # Statistics
    total_records = models.PositiveIntegerField(default=0)
    processed_records = models.PositiveIntegerField(default=0)
    failed_records = models.PositiveIntegerField(default=0)
    
    # Error handling
    error_message = models.TextField(blank=True, null=True)
    error_details = models.JSONField(default=dict, blank=True)
    
    # Metadata
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='data_imports'
    )
    
    class Meta:
        ordering = ['-started_at']
        verbose_name = 'Data Import'
        verbose_name_plural = 'Data Imports'
    
    def __str__(self):
        return f"{self.filename} - {self.status}"
    
    @property
    def progress_percentage(self):
        """Calculate import progress percentage"""
        if self.total_records == 0:
            return 0
        return (self.processed_records / self.total_records) * 100
    
    @property
    def duration(self):
        """Calculate import duration"""
        if self.completed_at and self.started_at:
            return self.completed_at - self.started_at
        return None