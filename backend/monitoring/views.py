from rest_framework import viewsets, permissions, response
from .models import MonitoringPlan, ScreenshotLog, ApplicationUsage, WebsiteUsage
from .serializers import *
from django.db.models import Avg, Sum
from accounts.models import User
from attendance.models import AttendanceRecord
from tasks.models import Task
from django.utils import timezone
from datetime import timedelta

from .services import ScoringService
from .models import MonitoringPlan, ScreenshotLog, ApplicationUsage, WebsiteUsage, ProductivitySnapshot

class MonitoringPlanViewSet(viewsets.ModelViewSet):
    queryset = MonitoringPlan.objects.all()
    serializer_class = MonitoringPlanSerializer

class ScreenshotLogViewSet(viewsets.ModelViewSet):
    queryset = ScreenshotLog.objects.all().order_by('-captured_at')
    serializer_class = ScreenshotLogSerializer

class UsageViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        apps = ApplicationUsage.objects.filter(user=user).order_by('-logged_at')[:50]
        webs = WebsiteUsage.objects.filter(user=user).order_by('-logged_at')[:50]
        return response.Response({
            "apps": ApplicationUsageSerializer(apps, many=True).data,
            "webs": WebsiteUsageSerializer(webs, many=True).data
        })

class ProductivityViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, pk=None):
        try:
            target_user = User.objects.get(pk=pk or request.user.id)
        except User.DoesNotExist:
            return response.Response({"error": "User not found"}, status=404)

        # Use centralized ScoringService
        metrics = ScoringService.calculate_score(target_user)
        
        # Save snapshot if user is viewing their own productivity
        if not pk or int(pk) == request.user.id:
            ScoringService.generate_snapshot(target_user)

        return response.Response({
            "user": target_user.username,
            "overall_score": metrics["overall"],
            "breakdown": metrics["breakdown"]
        })

    def list(self, request):
        # Return historical snapshots for the chart
        user = request.user
        snapshots = ProductivitySnapshot.objects.filter(user=user).order_by('date')[:30]
        return response.Response(ProductivitySnapshotSerializer(snapshots, many=True).data)

class ProductivitySnapshotViewSet(viewsets.ModelViewSet):
    queryset = ProductivitySnapshot.objects.all()
    serializer_class = ProductivitySnapshotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Admin':
            return ProductivitySnapshot.objects.all()
        elif user.role == 'Manager':
            # Managers can see snapshots of everyone or filter by team in future
            return ProductivitySnapshot.objects.all()
        return ProductivitySnapshot.objects.filter(user=user)

    def partial_update(self, request, *args, **kwargs):
        if request.user.role not in ['Admin', 'Manager']:
            return response.Response({"error": "Unauthorized. Only managers can update feedback."}, status=403)
        return super().partial_update(request, *args, **kwargs)
