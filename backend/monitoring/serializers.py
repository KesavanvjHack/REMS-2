from rest_framework import serializers
from .models import MonitoringPlan, ScreenshotLog, ApplicationUsage, WebsiteUsage, ProductivitySnapshot

class MonitoringPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonitoringPlan
        fields = '__all__'

class ScreenshotLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = ScreenshotLog
        fields = '__all__'

class ApplicationUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationUsage
        fields = '__all__'

class WebsiteUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteUsage
        fields = '__all__'

class ProductivitySnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductivitySnapshot
        fields = ['date', 'score', 'breakdown']
