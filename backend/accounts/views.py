import random
from django.contrib.auth import authenticate

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTP, User
from .serializers import SignupSerializer


# ========================
# SEND OTP
# ========================
@api_view(["POST"])
@permission_classes([AllowAny])
def send_otp(request):
    mobile = request.data.get("mobile")

    if not mobile:
        return Response({"message": "Mobile number required"}, status=400)

    otp = str(random.randint(100000, 999999))

    # delete old OTP
    OTP.objects.filter(mobile=mobile).delete()

    OTP.objects.create(mobile=mobile, otp=otp)

    print("OTP:", otp)  # for testing

    return Response({
        "message": "OTP sent successfully",
        "otp": otp   # ✅ return otp to frontend (for testing)
    }, status=200)


# =====================
# VERIFY OTP
# =====================
@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    mobile = request.data.get("mobile")
    otp = request.data.get("otp")

    if not mobile or not otp:
        return Response({"message": "Mobile and OTP required"}, status=400)

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
        serializer.save()
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

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
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
