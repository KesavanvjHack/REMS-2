from datetime import datetime, timedelta
from django.utils import timezone
from .models import WorkSession, BreakSession, IdleLog

class SessionService:
    @staticmethod
    def punch_in(user, ip=None, user_agent=None):
        # Close any open sessions for this user before starting new one
        # If open session is very old (> 16 hours), close it with a reasonable end time
        now = timezone.now()
        active_sessions = WorkSession.objects.filter(user=user, end_time__isnull=True)
        for s in active_sessions:
            if (now - s.start_time).total_seconds() > 57600: # 16 hours
                s.end_time = s.start_time + timedelta(hours=8) # Guess 8 hours
                s.save()
            else:
                s.end_time = now
                s.save()
        
        return WorkSession.objects.create(
            user=user,
            start_time=timezone.now(),
            ip_address=ip,
            user_agent=user_agent
        )

    @staticmethod
    def punch_out(user):
        session = WorkSession.objects.filter(user=user, end_time__isnull=True).last()
        if session:
            now = timezone.now()
            session.end_time = now
            session.save()
            
            # Also close open breaks/idle logs
            BreakSession.objects.filter(user=user, end_time__isnull=True).update(end_time=now)
            IdleLog.objects.filter(user=user, end_time__isnull=True).update(end_time=now)
            return session
        return None

    @staticmethod
    def start_break(user, break_type='SHORT'):
        work_session = WorkSession.objects.filter(user=user, end_time__isnull=True).first()
        if not work_session:
            return None
        
        # Close existing open breaks
        BreakSession.objects.filter(user=user, end_time__isnull=True).update(end_time=timezone.now())
        
        return BreakSession.objects.create(
            user=user,
            work_session=work_session,
            break_type=break_type,
            start_time=timezone.now()
        )

    @staticmethod
    def stop_break(user):
        brk = BreakSession.objects.filter(user=user, end_time__isnull=True).first()
        if brk:
            brk.end_time = timezone.now()
            brk.save()
            return brk
        return None

    @staticmethod
    def log_heartbeat(user):
        """
        Logic for heartbeat to detect/close idle logs.
        If last activity was more than threshold, start idle log.
        If heartbeat arrives while idle log open, close it.
        """
        # (This will be called by the middleware/view)
        # For simplicity in this step, we'll implement full logic in the activity view
        pass
