"""
Custom caching utilities for POST endpoints with JSON payloads.
"""
import hashlib
import json
from functools import wraps
from django.core.cache import cache
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)


def cache_post_response(timeout=300):
    """
    Decorator to cache POST endpoint responses based on request body hash.
    
    Args:
        timeout: Cache timeout in seconds (default: 5 minutes)
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(self, request, *args, **kwargs):
            # Generate cache key from request body
            request_body = json.dumps(request.data, sort_keys=True)
            cache_key_hash = hashlib.md5(request_body.encode()).hexdigest()
            cache_key = f"post_cache:{view_func.__name__}:{cache_key_hash}"
            
            logger.info(f"Cache key: {cache_key}")
            
            # Try to get cached response
            cached_response = cache.get(cache_key)
            if cached_response is not None:
                logger.info(f"Cache HIT for {view_func.__name__}")
                # Return cached response
                return Response(cached_response, status=200)
            
            logger.info(f"Cache MISS for {view_func.__name__}")
            
            # Execute view function
            response = view_func(self, request, *args, **kwargs)
            
            # Cache successful responses only
            if response.status_code == 200 and hasattr(response, 'data'):
                logger.info(f"Caching response for {view_func.__name__} (timeout={timeout}s)")
                cache.set(cache_key, response.data, timeout)
            
            return response
        return wrapper
    return decorator
