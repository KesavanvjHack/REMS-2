from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendancePolicyViewSet

router = DefaultRouter()
router.register(r'', AttendancePolicyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
