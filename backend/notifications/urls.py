from rest_framework.routers import DefaultRouter
from .views import AlertLogViewSet

router = DefaultRouter()
router.register('alerts', AlertLogViewSet, basename='alert')

urlpatterns = router.urls
