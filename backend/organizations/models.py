from django.db import models
from core.models import BaseModel

class Company(BaseModel):
    name = models.CharField(max_length=200)
    registration_id = models.CharField(max_length=100, unique=True)
    address = models.TextField()
    contact_email = models.EmailField()
    website = models.URLField(blank=True)

    def __str__(self):
        return self.name

class Department(BaseModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to="logos/", null=True, blank=True)
    theme_color = models.CharField(max_length=20, default="#3b82f6")

    def __str__(self):
        return f"{self.name} ({self.company.name})"

class Team(BaseModel):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='teams')
    name = models.CharField(max_length=100)
    manager = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='managed_teams')

    def __str__(self):
        return self.name
