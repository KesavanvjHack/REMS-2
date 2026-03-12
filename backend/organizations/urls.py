from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, DepartmentViewSet, TeamViewSet

router = DefaultRouter()
router.register('companies', CompanyViewSet)
router.register('departments', DepartmentViewSet)
router.register('teams', TeamViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
