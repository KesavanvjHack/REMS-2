from rest_framework import serializers
from .models import Company, Department, Team
from accounts.models import User

class TeamSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.username', read_only=True)
    class Meta:
        model = Team
        fields = ['id', 'name', 'manager', 'manager_name']

class DepartmentSerializer(serializers.ModelSerializer):
    teams = TeamSerializer(many=True, read_only=True)
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'teams']

class CompanySerializer(serializers.ModelSerializer):
    departments = DepartmentSerializer(many=True, read_only=True)
    class Meta:
        model = Company
        fields = ['id', 'name', 'registration_id', 'address', 'contact_email', 'website', 'departments']

class OrgTreeSerializer(serializers.ModelSerializer):
    """Simplified tree structure for the Organogram visualization"""
    children = serializers.SerializerMethodField()
    type = serializers.CharField(default='company')

    class Meta:
        model = Company
        fields = ['id', 'name', 'type', 'children']

    def get_children(self, obj):
        return [
            {
                "id": dept.id,
                "name": dept.name,
                "type": "department",
                "children": [
                    {
                        "id": team.id,
                        "name": team.name,
                        "type": "team",
                        "manager": team.manager.username if team.manager else "N/A"
                    } for team in dept.teams.all()
                ]
            } for dept in obj.departments.all()
        ]
