from rest_framework import serializers
from .models import User


class SignupSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False)

    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            "id",              # auto-generated
            "username",
            "password",
            "fullname",
            "designation",
            "department",
            "role",
            "gender",
            "address",
            "mobile",
            "date_of_joining",
            "profile_picture",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user
    
    
class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = '__all__'