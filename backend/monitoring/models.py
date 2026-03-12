from django.db import models
from core.models import BaseModel
from django.conf import settings

class MonitoringPlan(BaseModel):
    name = models.CharField(max_length=50) # Basic, Pro, Enterprise
    price = models.DecimalField(max_digits=10, decimal_places=2)
    screenshot_interval = models.PositiveIntegerField(default=10) # minutes
    features = models.JSONField(default=dict) # {"screenshots": true, "apps": true, ...}

    def __str__(self):
        return self.name

class ScreenshotLog(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='screenshots/%Y/%m/%d/')
    captured_at = models.DateTimeField(auto_now_add=True)

class ApplicationUsage(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    app_name = models.CharField(max_length=200)
    duration_seconds = models.PositiveIntegerField(default=0)
    is_productive = models.BooleanField(default=True)
    logged_at = models.DateTimeField(auto_now_add=True)

class WebsiteUsage(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    url = models.URLField(max_length=500)
    duration_seconds = models.PositiveIntegerField(default=0)
    is_productive = models.BooleanField(default=True)
    logged_at = models.DateTimeField(auto_now_add=True)

class ProductivitySnapshot(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='productivity_snapshots')
    score = models.DecimalField(max_digits=5, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    breakdown = models.JSONField(default=dict) # {"attendance": 80, "tasks": 90, "usage": 70}

    class Meta:
        get_latest_by = 'date'
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.date} - Score: {self.score}"
