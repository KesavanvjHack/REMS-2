import logging
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
    def log_heartbeat(user, ip=None, user_agent=None):
        """
        Receives heartbeat from frontend. 
        Saves Heartbeat record for real-time monitoring.
        If user is idle for > threshold (e.g. 5 mins), mark as idle.
        Implements Module 9: WFH Validation (Suspicious activity detection).
        """
        from .models import Heartbeat
        now = timezone.now()
        threshold_minutes = 5
        
        # Check if user has an active work session
        work_session = WorkSession.objects.filter(user=user, end_time__isnull=True).last()
        if not work_session:
            return "offline"

        # Module 9: WFH Validation - Check for IP or UA change
        if ip and work_session.ip_address and ip != work_session.ip_address:
            # Possible suspicious activity - log it
            from audit.models import AuditLog
            AuditLog.objects.create(
                user=user,
                action="SECURITY_ALERT",
                description=f"IP mismatch detected during active session. Session IP: {work_session.ip_address}, Current IP: {ip}",
                ip_address=ip,
                module="WFH_VALIDATION"
            )
        
        # Determine current status
        status_val = "working"
        on_break = BreakSession.objects.filter(user=user, end_time__isnull=True).exists()
        if on_break:
            status_val = "on_break"
        else:
            # Logic for Idle Detection:
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
                    status_val = "idle"

        # Save persistent heartbeat
        Heartbeat.objects.create(
            user=user,
            work_session=work_session,
            ip_address=ip,
            user_agent=user_agent,
            status=status_val
        )
        
        return status_val
