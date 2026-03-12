from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from .models import ApplicationUsage, WebsiteUsage, ProductivitySnapshot
from attendance.models import AttendanceRecord
from tasks.models import Task
from decimal import Decimal

class ScoringService:
    @staticmethod
    def calculate_score(user, days=7):
        """
        Calculates productivity score based on:
        1. Attendance (30%)
        2. Task Completion (40%)
        3. App/Web Usage (30%)
        """
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        # 1. Attendance Score
        # Expecting at least 'days' records (simplified logic)
        attendance_count = AttendanceRecord.objects.filter(user=user, date__gte=start_date).count()
        attendance_score = (attendance_count / days) * 100
        attendance_score = min(100, attendance_score)

        # 2. Task Completion Score
        tasks = Task.objects.filter(assignee=user)
        total_tasks = tasks.count()
        done_tasks = tasks.filter(status='DONE').count()
        task_score = (done_tasks / total_tasks * 100) if total_tasks > 0 else 100

        # 3. Usage Score
        prod_usage = ApplicationUsage.objects.filter(user=user, is_productive=True, logged_at__date__gte=start_date).aggregate(Sum('duration_seconds'))['duration_seconds__sum'] or 0
        total_usage = ApplicationUsage.objects.filter(user=user, logged_at__date__gte=start_date).aggregate(Sum('duration_seconds'))['duration_seconds__sum'] or 0
        
        # Add website usage as well
        prod_webs = WebsiteUsage.objects.filter(user=user, is_productive=True, logged_at__date__gte=start_date).aggregate(Sum('duration_seconds'))['duration_seconds__sum'] or 0
        total_webs = WebsiteUsage.objects.filter(user=user, logged_at__date__gte=start_date).aggregate(Sum('duration_seconds'))['duration_seconds__sum'] or 0
        
        usage_prod = prod_usage + prod_webs
        usage_total = total_usage + total_webs
        
        usage_score = (usage_prod / usage_total * 100) if usage_total > 0 else 100

        # Weighted calculation
        overall_score = (attendance_score * 0.3) + (task_score * 0.4) + (usage_score * 0.3)
        
        return {
            "overall": round(overall_score, 2),
            "breakdown": {
                "attendance": round(attendance_score, 2),
                "tasks": round(task_score, 2),
                "usage": round(usage_score, 2)
            }
        }

    @staticmethod
    def generate_snapshot(user):
        """Generates and saves a productivity snapshot for the current day."""
        metrics = ScoringService.calculate_score(user)
        snapshot, created = ProductivitySnapshot.objects.update_or_create(
            user=user,
            date=timezone.now().date(),
            defaults={
                "score": Decimal(str(metrics["overall"])),
                "breakdown": metrics["breakdown"]
            }
        )
        return snapshot
