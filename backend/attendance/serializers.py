from rest_framework import serializers
from .models import AttendanceRecord

class AttendanceRecordSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    fullname = serializers.CharField(source='user.fullname', read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = '__all__'
