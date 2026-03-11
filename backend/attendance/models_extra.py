from django.db import models
from django.conf import settings
from core.models import BaseModel

class LeaveRequest(BaseModel):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    LEAVE_TYPES = (
        ('SICK', 'Sick Leave'),
        ('CASUAL', 'Casual Leave'),
        ('ANNUAL', 'Annual Leave'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_leaves')
    review_remarks = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.leave_type} ({self.start_date} to {self.end_date})"

class Holiday(BaseModel):
    name = models.CharField(max_length=100)
    date = models.DateField(unique=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} on {self.date}"
