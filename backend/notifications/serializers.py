from rest_framework import serializers
from .models import AlertLog

class AlertLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = AlertLog
        fields = '__all__'
