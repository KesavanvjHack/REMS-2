from rest_framework import serializers
from .models import WorkSession, BreakSession, IdleLog

class BreakSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BreakSession
        fields = '__all__'

class WorkSessionSerializer(serializers.ModelSerializer):
    breaks = BreakSessionSerializer(many=True, read_only=True)
    
    class Meta:
        model = WorkSession
        fields = '__all__'

class IdleLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdleLog
        fields = '__all__'
