from rest_framework.routers import DefaultRouter
from .views import MonitoringPlanViewSet, ScreenshotLogViewSet, UsageViewSet, ProductivityViewSet, ProductivitySnapshotViewSet
from django.urls import path

router = DefaultRouter()
router.register(r'usage', UsageViewSet, basename='usage')
router.register(r'productivity', ProductivityViewSet, basename='productivity')
router.register(r'snapshots', ProductivitySnapshotViewSet, basename='snapshots')

urlpatterns = [
    path('usage/', UsageViewSet.as_view({'get': 'list'})),
    path('productivity/', ProductivityViewSet.as_view({'get': 'retrieve'})),
    path('productivity/<int:pk>/', ProductivityViewSet.as_view({'get': 'retrieve'})),
] + router.urls
