from django.urls import path
from . import views

urlpatterns = [
    # Data processing endpoints
    path('', views.data_processing_home, name='data_processing_home'),
    path('health/', views.health, name='health'),
    path('query-entities/', views.query_entities, name='query_entities'),
    path('query-related-entities/', views.query_related_entities, name='query_related_entities'),
    path('query-contracts-by-entity/', views.query_contracts_by_entity, name='query_contracts_by_entity'),
    path('available-time-ranges/', views.get_available_time_ranges, name='get_available_time_ranges'),
    # Removed duplicate advanced-search endpoint - use /api/v1/contracts/advanced-search/ instead
]
