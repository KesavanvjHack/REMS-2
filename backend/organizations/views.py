from rest_framework import viewsets, permissions, response, decorators
from .models import Company, Department, Team
from .serializers import CompanySerializer, DepartmentSerializer, TeamSerializer, OrgTreeSerializer

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    @decorators.action(detail=True, methods=['get'])
    def tree(self, request, pk=None):
        company = self.get_object()
        serializer = OrgTreeSerializer(company)
        return response.Response(serializer.data)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
