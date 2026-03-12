from rest_framework import serializers
from .models import Project, Task, ProjectMember
from django.contrib.auth import get_user_model

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.username', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'

class ProjectMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = ProjectMember
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.username', read_only=True)
    task_count = serializers.IntegerField(source='tasks.count', read_only=True)
    members = ProjectMemberSerializer(many=True, read_only=True)
    completion_percentage = serializers.SerializerMethodField()
    allocated_budget = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_completion_percentage(self, obj):
        total = obj.tasks.count()
        if total == 0:
            return 0
        done = obj.tasks.filter(status='DONE').count()
        return round((done / total) * 100, 2)
    
    def get_allocated_budget(self, obj):
        # Sum (hourly_rate * allocated_hours) for all members
        from django.db.models import F, Sum
        total = obj.members.aggregate(
            total=Sum(F('hourly_rate') * F('allocated_hours'))
        )['total'] or 0
        return float(total)
