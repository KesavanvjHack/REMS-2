from django.db import models
from django.conf import settings
from core.models import BaseModel

class AuditLog(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=100)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    module = models.CharField(max_length=50, help_text="Module where action occurred")

    def __str__(self):
        return f"{self.action} by {self.user.username if self.user else 'System'} at {self.created_at}"
