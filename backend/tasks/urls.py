from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet, ProjectMemberViewSet

router = DefaultRouter()
router.register('projects', ProjectViewSet, basename='project')
router.register('tasks', TaskViewSet, basename='task')
router.register('members', ProjectMemberViewSet, basename='member')

urlpatterns = router.urls
