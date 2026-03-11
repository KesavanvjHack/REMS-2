from rest_framework import serializers
from .models import AttendanceRecord, LeaveRequest, Holiday

class AttendanceRecordSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    fullname = serializers.CharField(source='user.fullname', read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.username', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = '__all__'

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'
