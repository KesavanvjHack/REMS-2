from django.db import models
from django.conf import settings
from core.models import BaseModel

class AttendanceRecord(BaseModel):
    STATUS_CHOICES = (
        ('PRESENT', 'Present'),
        ('HALF_DAY', 'Half Day'),
        ('ABSENT', 'Absent'),
        ('ON_LEAVE', 'On Leave'),
        ('HOLIDAY', 'Holiday'),
        ('INACTIVE', 'Inactive'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ABSENT')
    
    total_work_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    total_break_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    total_idle_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    net_work_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    is_late = models.BooleanField(default=False)
    remarks = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.status}"
