from rest_framework import viewsets, permissions
from .models import AlertLog
from .serializers import AlertLogSerializer

class AlertLogViewSet(viewsets.ModelViewSet):
    queryset = AlertLog.objects.all().order_by('-created_at')
    serializer_class = AlertLogSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Employee':
            return AlertLog.objects.filter(user=user).order_by('-created_at')
        return AlertLog.objects.all().order_by('-created_at')
