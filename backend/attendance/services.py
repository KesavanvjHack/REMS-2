from decimal import Decimal
from django.utils import timezone
from .models import AttendanceRecord
from sessions.models import WorkSession, BreakSession, IdleLog
from policies.models import AttendancePolicy

class AttendanceEngine:
    @staticmethod
    def calculate_daily_attendance(user, date):
        policy = AttendancePolicy.objects.filter(is_active=True).first()
        if not policy:
            return None

        # Get sessions for this date
        sessions = WorkSession.objects.filter(
            user=user, 
            start_time__date=date
        )
        
        if not sessions.exists():
            # Check for holiday or leave (mock logic for now)
            # Record as ABSENT if no sessions
            AttendanceRecord.objects.update_or_create(
                user=user, date=date,
                defaults={'status': 'ABSENT', 'total_work_hours': 0}
            )
            return

        total_work_sec = 0
        total_break_sec = 0
        total_idle_sec = 0

        for session in sessions:
            if session.end_time:
                total_work_sec += (session.end_time - session.start_time).total_seconds()
            
            # Breaks tied to this session
            breaks = BreakSession.objects.filter(work_session=session)
            for b in breaks:
                if b.end_time:
                    total_break_sec += (b.end_time - b.start_time).total_seconds()
            
            # Idle logs
            idles = IdleLog.objects.filter(work_session=session)
            for i in idles:
                if i.end_time:
                    total_idle_sec += (i.end_time - i.start_time).total_seconds()

        work_hours = Decimal(total_work_sec) / 3600
        break_hours = Decimal(total_break_sec) / 3600
        idle_hours = Decimal(total_idle_sec) / 3600
        net_hours = work_hours - break_hours - idle_hours

        # Late detection
        first_session = sessions.order_by('start_time').first()
        is_late = False
        if first_session:
            shift_start_dt = timezone.make_aware(timezone.datetime.combine(date, policy.shift_start))
            grace_dt = shift_start_dt + timezone.timedelta(minutes=policy.grace_period)
            if first_session.start_time > grace_dt:
                is_late = True

        # Status calculation
        status = 'ABSENT'
        if net_hours >= policy.min_full_day_hours:
            status = 'PRESENT'
        elif net_hours >= policy.min_half_day_hours:
            status = 'HALF_DAY'

        AttendanceRecord.objects.update_or_create(
            user=user, date=date,
            defaults={
                'status': status,
                'total_work_hours': round(work_hours, 2),
                'total_break_hours': round(break_hours, 2),
                'total_idle_hours': round(idle_hours, 2),
                'net_work_hours': round(net_hours, 2),
                'is_late': is_late
            }
        )
