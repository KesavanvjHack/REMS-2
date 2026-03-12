from django.urls import path
from .views import ReportSummaryView, TeamAnalyticsView

urlpatterns = [
    path('summary/', ReportSummaryView.as_view(), name='report-summary'),
    path('dashboard-stats/', ReportSummaryView.as_view(), name='dashboard-stats'),
    path('team-analytics/', TeamAnalyticsView.as_view(), name='team-analytics'),
]
