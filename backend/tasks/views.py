from rest_framework import viewsets, permissions, filters
from .models import Project, Task, ProjectMember
from .serializers import ProjectSerializer, TaskSerializer, ProjectMemberSerializer
from core.permissions import IsAdmin, IsManager

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().prefetch_related('members', 'tasks').order_by('-created_at')
    serializer_class = ProjectSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsManager()]
        return [permissions.IsAuthenticated()]

class ProjectMemberViewSet(viewsets.ModelViewSet):
    queryset = ProjectMember.objects.all().select_related('user', 'project')
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsManager]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__username', 'project__name']

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('order', '-created_at')
    serializer_class = TaskSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'created_at', 'priority']

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.all().select_related('project', 'assignee')
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        if user.role == 'Employee':
            return queryset.filter(assignee=user)
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsManager()]
        return [permissions.IsAuthenticated()]
