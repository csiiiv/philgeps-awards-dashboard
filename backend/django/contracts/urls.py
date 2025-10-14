from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContractViewSet, OrganizationViewSet, ContractorViewSet,
    BusinessCategoryViewSet, AreaOfDeliveryViewSet, DataImportViewSet
)

router = DefaultRouter()
router.register(r'contracts', ContractViewSet)
router.register(r'organizations', OrganizationViewSet)
router.register(r'contractors', ContractorViewSet)
router.register(r'business-categories', BusinessCategoryViewSet)
router.register(r'areas-of-delivery', AreaOfDeliveryViewSet)
router.register(r'data-imports', DataImportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
