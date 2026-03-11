from django.db import models
from core.models import BaseModel

class AttendancePolicy(BaseModel):
    name = models.CharField(max_length=100, default="Global Policy")
    is_active = models.BooleanField(default=True)
    
    shift_start = models.TimeField(help_text="Expected shift start time")
    shift_end = models.TimeField(help_text="Expected shift end time")
    grace_period = models.PositiveIntegerField(default=15, help_text="Minutes allowed after shift start before marked late")
    
    min_full_day_hours = models.DecimalField(max_digits=4, decimal_places=2, default=8.0)
    min_half_day_hours = models.DecimalField(max_digits=4, decimal_places=2, default=4.0)
    
    max_idle_minutes = models.PositiveIntegerField(default=30, help_text="Idle threshold before flagging")
    break_duration_limit = models.PositiveIntegerField(default=60, help_text="Max allowed break minutes per day")

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"

    class Meta:
        verbose_name_plural = "Attendance Policies"
