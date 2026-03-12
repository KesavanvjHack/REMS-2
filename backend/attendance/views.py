from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.models import User
from .models import AttendanceRecord, LeaveRequest, Holiday
from .serializers import AttendanceRecordSerializer, LeaveRequestSerializer, HolidaySerializer
from core.permissions import IsManager

class AttendanceRecordViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AttendanceRecordSerializer

    def get_queryset(self):
        """
        Optimized queryset using select_related to join User table in a single query.
        Implements RBAC: Employees see only their records; Admin/Managers see all.
        """
        user = self.request.user
        queryset = AttendanceRecord.objects.all().select_related('user').order_by('-date')
        if user.role in ['Admin', 'Manager']:
            return queryset
        return queryset.filter(user=user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def team_summary(self, request):
        """
        High-performance team summary dashboard endpoint.
        Uses optimized aggregations to minimize DB load.
        """
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
                "avgHours": u_records.aggregate(Avg('total_work_hours'))['total_work_hours__avg'] or 0,
            })

        return Response({
            "total_employees": total_employees,
            "present_today": present_today,
            "late_today": late_today,
            "team_details": team_data
        })

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def finalize_day(self, request):
        """Allow an employee to finalize their own attendance for a given date."""
        from .services import AttendanceEngine
        date_str = request.data.get('date')
        if not date_str:
            return Response({"error": "Date is required"}, status=400)
            
        try:
            date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)

        record = AttendanceEngine.finalize_attendance_manual(request.user, date)
        return Response(AttendanceRecordSerializer(record).data)

    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def approve(self, request, pk=None):
        """Allow a manager/admin to approve or reject a finalized attendance record."""
        record = self.get_object()
        if not record.is_finalized:
            return Response({"error": "Record must be finalized before approval"}, status=400)
            
        status = request.data.get('status') # APPROVED or REJECTED
        if status not in ['APPROVED', 'REJECTED']:
            return Response({"error": "Invalid status. Use APPROVED or REJECTED"}, status=400)

        record.approval_status = status
        record.approved_by = request.user
        record.remarks = request.data.get('remarks', record.remarks)
        record.save()
        
        return Response(AttendanceRecordSerializer(record).data)

class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['Admin', 'Manager']:
            return LeaveRequest.objects.all().select_related('user').order_by('-created_at')
        return LeaveRequest.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def approve_manager(self, request, pk=None):
        leave = self.get_object()
        status = request.data.get('status')
        if status not in ['APPROVED', 'REJECTED']:
            return Response({"error": "Invalid status"}, status=400)
        
        leave.manager_status = status
        leave.manager_remarks = request.data.get('remarks', '')
        leave.manager_reviewed_by = request.user
        
        # If manager rejects, final status is rejected
        if status == 'REJECTED':
            leave.status = 'REJECTED'
            leave.reviewed_by = request.user
            leave.review_remarks = "Rejected by Manager"
        
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve_hr(self, request, pk=None):
        leave = self.get_object()
        if leave.manager_status != 'APPROVED':
            return Response({"error": "Manager must approve before HR"}, status=400)
            
        status = request.data.get('status')
        if status not in ['APPROVED', 'REJECTED']:
            return Response({"error": "Invalid status"}, status=400)
            
        leave.hr_status = status
        leave.hr_remarks = request.data.get('remarks', '')
        leave.hr_reviewed_by = request.user
        
        if status == 'REJECTED':
            leave.status = 'REJECTED'
            leave.reviewed_by = request.user
            leave.review_remarks = "Rejected by HR/Admin"
        elif status == 'APPROVED':
            leave.status = 'APPROVED'
            leave.reviewed_by = request.user
            leave.review_remarks = "Fully Approved"
            
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)

class HolidayViewSet(viewsets.ModelViewSet):
    queryset = Holiday.objects.all().order_by('date')
    serializer_class = HolidaySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
