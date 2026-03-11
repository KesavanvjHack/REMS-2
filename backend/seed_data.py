import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from policies.models import AttendancePolicy
from datetime import time

User = get_user_model()

def seed():
    # 1. Create default policy
    if not AttendancePolicy.objects.exists():
        AttendancePolicy.objects.create(
            name="Default Corporate Policy",
            shift_start=time(9, 0),
            shift_end=time(18, 0),
            grace_period=15,
            min_full_day_hours=8.0,
            min_half_day_hours=4.0,
            max_idle_minutes=30,
            break_duration_limit=60
        )
        print("Created default policy.")

    # 2. Create users
    users = [
        ('admin', 'admin123', 'System Admin', 'Admin', 'IT'),
        ('manager', 'manager123', 'Team Manager', 'Manager', 'Engineering'),
        ('employee', 'employee123', 'John Doe', 'Employee', 'Engineering'),
    ]

    for username, password, fullname, role, dept in users:
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(
                username=username,
                password=password,
                fullname=fullname,
                role=role,
                department=dept,
                designation="Senior " + role,
                mobile="98765" + str(hash(username))[:5]
            )
            if role == 'Admin':
                user.is_superuser = True
                user.is_staff = True
                user.save()
            print(f"Created {role} user: {username}")

if __name__ == "__main__":
    seed()
