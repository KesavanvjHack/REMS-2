from rest_framework import views, response, permissions
from attendance.models import AttendanceRecord
from django.db.models import Sum, Avg, Count
from django.utils import timezone
from datetime import timedelta

class ReportSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # Simple summary for the dashboard
        qs = AttendanceRecord.objects.all() if user.role in ['Admin', 'Manager'] else AttendanceRecord.objects.filter(user=user)
        
        # Weekly Trend (last 5 days)
        today = timezone.now().date()
        days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        trend = []
        for i in range(4, -1, -1):
            date = today - timedelta(days=i)
            day_qs = qs.filter(date=date)
            trend.append({
                "day": days_of_week[date.weekday()],
                "hours": day_qs.aggregate(Avg('total_work_hours'))['total_work_hours__avg'] or 0,
                "productive": day_qs.aggregate(Avg('net_work_hours'))['net_work_hours__avg'] or 0
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
                "idle": (late / total) * 100, # Using late as a proxy for 'idle' for simplified demo
                "break": (absent / total) * 100
            }
        }
        return response.Response(summary)

class TeamAnalyticsView(views.APIView):
    # Manager/Admin only
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        # Implementation for team-wide stats
        return response.Response({"msg": "Team analytics data"})
