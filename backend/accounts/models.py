from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    fullname = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    role = models.CharField(max_length=50)
    gender = models.CharField(max_length=10)
    address = models.TextField()
    mobile = models.CharField(max_length=10, unique=True)
    date_of_joining = models.DateField(auto_now_add=True)
    profile_picture = models.ImageField(upload_to="profiles/", null=True, blank=True)

    def __str__(self):
        return self.username


class OTP(models.Model):
    mobile = models.CharField(max_length=10)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.mobile} - {self.otp}"
    
    from django.db import models



