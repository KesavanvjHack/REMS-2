from django.urls import path
from .views import PunchView, BreakView, HeartbeatView

urlpatterns = [
    path('punch/', PunchView.as_view(), name='punch'),
    path('break/', BreakView.as_view(), name='break'),
    path('heartbeat/', HeartbeatView.as_view(), name='heartbeat'),
]
