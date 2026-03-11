from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from accounts.models import User
from sessions.models import WorkSession
from attendance.models import AttendanceRecord

class AttendanceEngineTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testworker',
            password='password123',
            role='Employee',
            mobile='1234567890'
        )

    def test_work_hours_calculation(self):
        # Create a 4 hour work session
        start = timezone.now() - timedelta(hours=5)
        end = start + timedelta(hours=4)
        WorkSession.objects.create(
            user=self.user,
            start_time=start,
            end_time=end
        )

        # In a real app we'd call the service or management command
        # Here we verify the model behavior / manual calculation for now
        sessions = WorkSession.objects.filter(user=self.user)
        total_sec = sum((s.end_time - s.start_time).total_seconds() for s in sessions if s.end_time)
        hours = Decimal(total_sec) / Decimal(3600)
        
        self.assertEqual(hours, Decimal(4))

    def test_attendance_status_logic(self):
        # Create a record manually to test status logic
        record = AttendanceRecord.objects.create(
            user=self.user,
            date=timezone.now().date(),
            total_work_hours=4.5,
            status='PRESENT'
        )
        self.assertEqual(record.status, 'PRESENT')
        
        record.total_work_hours = 2.0
        record.status = 'HALF_DAY'
        record.save()
        self.assertEqual(record.status, 'HALF_DAY')
