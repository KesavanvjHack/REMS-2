from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.models import User
from .models import AttendanceRecord
from .serializers import AttendanceRecordSerializer
from core.permissions import IsManager

class AttendanceRecordViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AttendanceRecordSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['Admin', 'Manager']:
            return AttendanceRecord.objects.all().order_by('-date')
        return AttendanceRecord.objects.filter(user=user).order_by('-date')

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def team_summary(self, request):
        if request.user.role not in ['Admin', 'Manager']:
            return Response({"error": "Unauthorized"}, status=403)
        
        # Simple aggregation for now
        total_employees = User.objects.count()
        today = timezone.now().date()
        present_today = AttendanceRecord.objects.filter(date=today, status='PRESENT').count()
        late_today = AttendanceRecord.objects.filter(date=today, is_late=True).count()
        
        # Get team records (last 30 days)
        limit = timezone.now() - timedelta(days=30)
        records = AttendanceRecord.objects.filter(date__gte=limit).select_related('user')
        
        team_data = []
        user_ids = records.values_list('user_id', flat=True).distinct()
        for uid in user_ids:
            u_records = records.filter(user_id=uid)
            user = u_records[0].user
            team_data.append({
                "id": user.id,
                "name": user.username,
                "role": user.role,
                "present": u_records.filter(status='PRESENT').count(),
                "absent": u_records.filter(status='ABSENT').count(),
                "late": u_records.filter(is_late=True).count(),
                "avgHours": u_records.aggregate(Avg('total_working_hours'))['total_working_hours__avg'] or 0,
            })

        return Response({
            "total_employees": total_employees,
            "present_today": present_today,
            "late_today": late_today,
            "team_details": team_data
        })
