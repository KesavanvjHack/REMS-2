from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceRecordViewSet, LeaveRequestViewSet, HolidayViewSet

router = DefaultRouter()
router.register(r'records', AttendanceRecordViewSet, basename='attendance-records')
router.register(r'leaves', LeaveRequestViewSet, basename='leave-requests')
router.register(r'holidays', HolidayViewSet, basename='holidays')

urlpatterns = [
    path('', include(router.urls)),
]
