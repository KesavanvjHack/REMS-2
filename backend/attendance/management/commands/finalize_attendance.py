from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from sessions.models import WorkSession, BreakSession
from attendance.models import AttendanceRecord, Holiday, LeaveRequest
from decimal import Decimal

class Command(BaseCommand):
    help = 'Finalizes attendance records for the previous day'

    def handle(self, *args, **options):
        # We usually run this for 'yesterday'
        target_date = timezone.now().date() - timedelta(days=1)
        self.stdout.write(f"Starting attendance finalization for {target_date}...")

        # 1. Close abandoned sessions from that date
        abandoned = WorkSession.objects.filter(
            start_time__date=target_date,
            end_time__isnull=True
        )
        for session in abandoned:
            # Auto-close at 8 hours after start or end of day
            session.end_time = session.start_time + timedelta(hours=8)
            session.save()
            self.stdout.write(f"Auto-closed session for {session.user.username}")

        # 2. Process all users
        users = User.objects.filter(is_active=True)
        for user in users:
            sessions = WorkSession.objects.filter(user=user, start_time__date=target_date)
            
            if not sessions.exists():
                # 2.1 Check for Holiday
                holiday = Holiday.objects.filter(date=target_date).first()
                if holiday:
                    AttendanceRecord.objects.update_or_create(
                        user=user,
                        date=target_date,
                        defaults={'status': 'HOLIDAY', 'remarks': holiday.name}
                    )
                    continue

                # 2.2 Check for Approved Leave
                leave = LeaveRequest.objects.filter(
                    user=user, 
                    status='APPROVED',
                    start_date__lte=target_date,
                    end_date__gte=target_date
                ).first()
                if leave:
                    AttendanceRecord.objects.update_or_create(
                        user=user,
                        date=target_date,
                        defaults={'status': 'ON_LEAVE', 'remarks': f"Leave: {leave.leave_type}"}
                    )
                    continue

                # 2.3 Mark as absent if no sessions and no holiday/leave
                AttendanceRecord.objects.get_or_create(
                    user=user,
                    date=target_date,
                    defaults={'status': 'ABSENT'}
                )
                continue

            # Calculate total hours
            total_sec = 0
            for s in sessions:
                if s.end_time:
                    total_sec += (s.end_time - s.start_time).total_seconds()

            work_hours = Decimal(total_sec) / Decimal(3600)
            
            # Simple status logic: > 4 hours = Present, else Half Day
            status = 'PRESENT' if work_hours >= 4 else 'HALF_DAY'
            
            # Check if late (e.g., first session after 9:30 AM)
            # In a real app we'd check against shift policy
            first_session = sessions.order_by('start_time').first()
            is_late = False
            if first_session:
                # Mocking a 9:00 AM start time
                start_limit = first_session.start_time.replace(hour=9, minute=0, second=0)
                if first_session.start_time > start_limit + timedelta(minutes=30):
                    is_late = True

            record, created = AttendanceRecord.objects.update_or_create(
                user=user,
                date=target_date,
                defaults={
                    'status': status,
                    'total_work_hours': round(work_hours, 2),
                    'net_work_hours': round(work_hours, 2), # Simplified
                    'is_late': is_late
                }
            )
            self.stdout.write(self.style.SUCCESS(f"Processed {user.username}: {status} ({work_hours:.2f}h)"))

        self.stdout.write(self.style.SUCCESS("Attendance finalization complete."))
