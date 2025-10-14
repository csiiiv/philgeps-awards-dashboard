"""
URL configuration for flood_control project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from django.http import JsonResponse

def api_info(request):
    """API information endpoint for production deployments"""
    return JsonResponse({
        'name': 'PhilGEPS Data Explorer API',
        'version': '1.0.0',
        'documentation': {
            'swagger': f"{request.scheme}://{request.get_host()}/api/docs/",
            'redoc': f"{request.scheme}://{request.get_host()}/api/redoc/",
            'schema': f"{request.scheme}://{request.get_host()}/api/schema/"
        },
        'endpoints': {
            'contracts': f"{request.scheme}://{request.get_host()}/api/v1/",
            'data_processing': f"{request.scheme}://{request.get_host()}/api/v1/data-processing/"
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('contracts.urls')),
    path('api/v1/data-processing/', include('data_processing.urls')),
    # OpenAPI Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API info endpoint for production
    path('', api_info, name='api_info'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    # In production, serve static files through WhiteNoise
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
