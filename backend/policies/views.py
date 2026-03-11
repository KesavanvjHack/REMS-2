from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from core.permissions import IsAdmin
from .models import AttendancePolicy
from .serializers import AttendancePolicySerializer

class AttendancePolicyViewSet(viewsets.ModelViewSet):
    queryset = AttendancePolicy.objects.all()
    serializer_class = AttendancePolicySerializer
    permission_classes = [IsAdmin]

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAdmin])
    def current(self, request):
        policy = AttendancePolicy.objects.first()
        if not policy:
            policy = AttendancePolicy.objects.create(name="Global Policy")
        
        if request.method in ['PUT', 'PATCH']:
            serializer = self.get_serializer(policy, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        
        serializer = self.get_serializer(policy)
        return Response(serializer.data)
