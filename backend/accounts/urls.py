from django.urls import path
from .views import *

urlpatterns = [
    path("send-otp/", send_otp),
    path("verify-otp/", verify_otp),
    path("signup/", signup),
    path("login/", login_view),
    path("dashboard/", dashboard),
    path("admin-dashboard/", admin_dashboard),
    path("bulk-import/", bulk_user_import),
    path("users/", list_users),
]



