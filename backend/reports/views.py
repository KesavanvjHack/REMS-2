from rest_framework import views, response, permissions
from attendance.models import AttendanceRecord
from django.db.models import Sum, Avg, Count
from django.utils import timezone
from datetime import timedelta

from django.core.cache import cache

class ReportSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        cache_key = f"user_summary_{user.id}" if user.role not in ['Admin', 'Manager'] else "admin_summary"
        
        # Try to get from cache
        cached_data = cache.get(cache_key)
        if cached_data:
            return response.Response(cached_data)

        # Simple summary for the dashboard
        qs = AttendanceRecord.objects.all() if user.role in ['Admin', 'Manager'] else AttendanceRecord.objects.filter(user=user)
        
        # Weekly Trend (last 5 days)
        today = timezone.now().date()
        days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        trend = []
        for i in range(4, -1, -1):
            date = today - timedelta(days=i)
            day_qs = qs.filter(date=date)
            # Use aggregation to avoid multiple queries
            aggs = day_qs.aggregate(
                avg_work=Avg('total_work_hours'),
                avg_productive=Avg('net_work_hours')
            )
            trend.append({
                "day": days_of_week[date.weekday()],
                "hours": aggs['avg_work'] or 0,
                "productive": aggs['avg_productive'] or 0
            })

        # Activity Breakdown (today)
        today_qs = qs.filter(date=today)
        total = today_qs.count() or 1
        active = today_qs.filter(status='PRESENT').count()
        absent = today_qs.filter(status='ABSENT').count()
        late = today_qs.filter(is_late=True).count()

        summary = {
            "total_present": qs.filter(status='PRESENT').count(),
            "total_absent": qs.filter(status='ABSENT').count(),
            "avg_working_hours": qs.aggregate(avg=Avg('net_work_hours'))['avg'] or 0,
            "total_late": qs.filter(is_late=True).count(),
            "weekly_trend": trend,
            "activity_breakdown": {
                "active": (active / total) * 100,
                "idle": (late / total) * 100,
                "break": (absent / total) * 100
            }
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, summary, 300)
        return response.Response(summary)

class TeamAnalyticsView(views.APIView):
    # Manager/Admin only
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        # Implementation for team-wide stats
        return response.Response({"msg": "Team analytics data"})
