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
    
    # Celery task management endpoints - always async for safety
    path('tasks/export/', views.trigger_export, name='trigger_export'),
    path('tasks/aggregates/', views.trigger_aggregates, name='trigger_aggregates'),
    path('tasks/search/', views.trigger_search, name='trigger_search'),
    path('tasks/analytics/', views.trigger_analytics, name='trigger_analytics'),
    path('tasks/analytics-paginated/', views.trigger_analytics_paginated, name='trigger_analytics_paginated'),
    path('tasks/status/', views.check_task_status, name='check_task_status'),
    path('tasks/result/', views.get_cached_result, name='get_cached_result'),
    path('tasks/active/', views.list_active_tasks, name='list_active_tasks'),
    path('tasks/cancel/', views.cancel_task, name='cancel_task'),
    
    # Advanced analytics endpoints
    path('benfords-law/', views.benfords_law_analysis, name='benfords_law_analysis'),
    path('rounding-patterns/', views.rounding_patterns_analysis, name='rounding_patterns_analysis'),
]
