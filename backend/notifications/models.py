from django.db import models
from core.models import BaseModel
from django.conf import settings

class AlertLog(BaseModel):
    TYPES = [
        ('IDLE', 'Idle Alert'),
        ('UNAUTHORIZED', 'Unauthorized Activity'),
        ('SYSTEM', 'System Notification'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=20, choices=TYPES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    severity = models.CharField(max_length=10, default='info') # info, warning, critical

    def __str__(self):
        return f"{self.alert_type} - {self.user.username}"
