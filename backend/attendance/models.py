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

    APPROVAL_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ABSENT')
    
    total_work_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    total_break_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    total_idle_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    net_work_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    is_late = models.BooleanField(default=False)
    is_finalized = models.BooleanField(default=False)
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_attendance')
    remarks = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'date')
        indexes = [
            models.Index(fields=['date', 'status']),
            models.Index(fields=['user', 'status']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.status}"

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
    
    # Tier 1: Manager Approval
    manager_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    manager_reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='manager_reviewed_leaves')
    manager_remarks = models.TextField(null=True, blank=True)
    
    # Tier 2: HR/Admin Approval
    hr_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    hr_reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='hr_reviewed_leaves')
    hr_remarks = models.TextField(null=True, blank=True)
    
    # Final Result (Consolidated)
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
