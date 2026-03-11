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
        Receives heartbeat from frontend. 
        If user is idle for > threshold (e.g. 5 mins), mark as idle.
        """
        now = timezone.now()
        threshold_minutes = 5
        
        # Check if user has an active work session
        work_session = WorkSession.objects.filter(user=user, end_time__isnull=True).last()
        if not work_session:
            return "offline"

        # Check if user is on break
        on_break = BreakSession.objects.filter(user=user, end_time__isnull=True).exists()
        if on_break:
            return "on_break"

        # Logic for Idle Detection:
        # We look at the last recorded Activity/Heartbeat (stored in User model or a cache)
        # For simplicity, we'll use a cache to store last heartbeat time
        from django.core.cache import cache
        cache_key = f"last_heartbeat_{user.id}"
        last_heartbeat = cache.get(cache_key)
        
        cache.set(cache_key, now, 600) # Store for 10 mins

        if last_heartbeat:
            diff = (now - last_heartbeat).total_seconds()
            if diff > (threshold_minutes * 60):
                # User was away, log idle period
                IdleLog.objects.create(
                    user=user,
                    work_session=work_session,
                    start_time=last_heartbeat,
                    end_time=now,
                    reason="Inactivity detected"
                )
                return "idle"
        
        return "working"
