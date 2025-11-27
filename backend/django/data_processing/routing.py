"""
WebSocket URL routing for data processing app
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/tasks/status/$', consumers.TaskStatusConsumer.as_asgi()),
]

