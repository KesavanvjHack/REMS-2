from rest_framework.routers import DefaultRouter
from .views import MonitoringPlanViewSet, ScreenshotLogViewSet, UsageViewSet, ProductivityViewSet
from django.urls import path

router = DefaultRouter()
router.register('plans', MonitoringPlanViewSet, basename='plan')
router.register('screenshots', ScreenshotLogViewSet, basename='screenshot')

urlpatterns = [
    path('usage/', UsageViewSet.as_view({'get': 'list'})),
    path('productivity/', ProductivityViewSet.as_view({'get': 'retrieve'})),
    path('productivity/<int:pk>/', ProductivityViewSet.as_view({'get': 'retrieve'})),
] + router.urls
