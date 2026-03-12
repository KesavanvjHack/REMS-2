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
        
        # Chart Data (last 7 days)
        today_dt = timezone.now()
        days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        chart_data = []
        for i in range(6, -1, -1):
            date = (today_dt - timedelta(days=i)).date()
            day_qs = qs.filter(date=date)
            from tasks.models import Task
            task_count = Task.objects.filter(assignee=user, created_at__date=date).count() if user.role == 'Employee' else Task.objects.filter(created_at__date=date).count()
            
            chart_data.append({
                "day": days_of_week[date.weekday()],
                "hours": float(day_qs.aggregate(avg=Avg('total_work_hours'))['avg'] or 0),
                "tasks": task_count
            })

        # Dashboard Summary
        from tasks.models import Task
        from attendance.models import LeaveRequest
        from sessions.models import WorkSession, IdleLog
        from accounts.models import User

        active_session = WorkSession.objects.filter(user=user, end_time__isnull=True).exists()
        
        # Activity Breakdown (today)
        today = today_dt.date()
        today_qs = qs.filter(date=today)
        total = today_qs.count() or 1
        present = today_qs.filter(status='PRESENT').count()
        absent = today_qs.filter(status='ABSENT').count()
        late = today_qs.filter(is_late=True).count()

        summary = {
            "status": "Working" if active_session else "Offline",
            "total_leaves": LeaveRequest.objects.filter(user=user, status='APPROVED').count(),
            "pending_tasks": Task.objects.filter(assignee=user).exclude(status='DONE').count() if user.role == 'Employee' else Task.objects.exclude(status='DONE').count(),
            "total_users": User.objects.filter(is_active=True).count(),
            "idle_alerts": IdleLog.objects.filter(work_session__start_time__date=today).count(),
            "chart_data": chart_data,
            "activity_breakdown": {
                "active": (present / total) * 100,
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
