from django.db import models
from django.conf import settings
from core.models import BaseModel

class WorkSession(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='work_sessions')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'start_time']),
            models.Index(fields=['start_time']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.start_time}"


class BreakSession(BaseModel):
    BREAK_TYPES = (
        ('LUNCH', 'Lunch'),
        ('SHORT', 'Short Break'),
        ('PERSONAL', 'Personal'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='break_sessions')
    work_session = models.ForeignKey(WorkSession, on_delete=models.CASCADE, related_name='breaks', null=True)
    break_type = models.CharField(max_length=20, choices=BREAK_TYPES, default='SHORT')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'start_time']),
            models.Index(fields=['work_session', 'break_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.break_type} ({self.start_time})"

class IdleLog(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='idle_logs')
    work_session = models.ForeignKey(WorkSession, on_delete=models.CASCADE, related_name='idle_logs', null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    reason = models.CharField(max_length=255, null=True, blank=True)


class Heartbeat(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='heartbeats')
    work_session = models.ForeignKey(WorkSession, on_delete=models.CASCADE, related_name='heartbeats', null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default='working') # working, idle, on_break

    class Meta:
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['work_session', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.timestamp} - {self.status}"
