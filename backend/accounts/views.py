import random
from django.contrib.auth import authenticate

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTP, User
from audit.models import AuditLog
from .serializers import SignupSerializer


# ========================
# SEND OTP
# ========================
@api_view(["POST"])
@permission_classes([AllowAny])
def send_otp(request):
    mobile = request.data.get("mobile")
    username = request.data.get("username")

    if not mobile and not username:
        return Response({"message": "Mobile or Username required"}, status=400)

    if username:
        user = User.objects.filter(username=username).first()
        if user:
            mobile = user.mobile
        else:
            return Response({"message": "User not found"}, status=404)

    if not mobile:
        return Response({"message": "User mobile not found"}, status=400)

    otp = str(random.randint(100000, 999999))
    OTP.objects.filter(mobile=mobile).delete()
    OTP.objects.create(mobile=mobile, otp=otp)

    print(f"OTP for {mobile}: {otp}")

    return Response({
        "message": "OTP sent successfully",
        "otp": otp,
        "mobile": f"******{mobile[-4:]}" if len(mobile) >= 4 else mobile
    }, status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    mobile = request.data.get("mobile")
    username = request.data.get("username")
    otp = request.data.get("otp")

    if not otp:
        return Response({"message": "OTP required"}, status=400)

    if username:
        user = User.objects.filter(username=username).first()
        if user:
            mobile = user.mobile

    if not mobile:
        return Response({"message": "Mobile required"}, status=400)

    otp_obj = OTP.objects.filter(mobile=mobile, otp=otp).first()

    if otp_obj:
        otp_obj.delete()
        return Response({"message": "OTP verified successfully"}, status=200)

    return Response({"message": "Invalid OTP"}, status=400)


# ========================
# SIGNUP
# ========================
@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        AuditLog.objects.create(
            user=user,
            action="SIGNUP",
            description=f"New user {user.username} registered",
            ip_address=request.META.get('REMOTE_ADDR'),
            module="AUTH"
        )
        return Response(
            {"message": "User registered successfully"},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ========================
# LOGIN (JWT + ROLE BASED)
# ========================
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"message": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)

        AuditLog.objects.create(
            user=user,
            action="LOGIN",
            description=f"User {user.username} logged in",
            ip_address=request.META.get('REMOTE_ADDR'),
            module="AUTH"
        )

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "profile_picture": user.profile_picture.url if user.profile_picture else None,
        }, status=status.HTTP_200_OK)

    return Response(
        {"error": "Invalid credentials"},
        status=status.HTTP_401_UNAUTHORIZED
    )


# ========================
# DASHBOARD (PROTECTED)
# ========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):
    return Response({
        "message": f"Welcome {request.user.username}",
        "user_id": request.user.id,
        "role": request.user.role
    }, status=status.HTTP_200_OK)


# ========================
# ADMIN DASHBOARD (ROLE BASED)
# ========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if request.user.role != "Admin":
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_403_FORBIDDEN
        )

    return Response({
        "message": "Welcome Admin Dashboard",
        "admin": request.user.username
    }, status=status.HTTP_200_OK)
