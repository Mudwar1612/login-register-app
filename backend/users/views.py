import random
import textwrap
from datetime import timedelta

from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import EmailOTP, UserProfile
from .serializers import (
    AdminUserSerializer,
    AdminUserUpdateSerializer,
    EmailOTPSerializer,
    MyTokenObtainPairSerializer,
    ProfileSerializer,
    RegisterSerializer,
)


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            UserProfile.objects.create(user=user, role="user")
            return Response(
                {"message": "User berhasil dibuat"}, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendOTPView(APIView):
    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"message": "Email wajib diisi"}, status=status.HTTP_400_BAD_REQUEST)
        
        otp = str(random.randint(100000, 999999))
        EmailOTP.objects.filter(email=email).delete()
        EmailOTP.objects.create(email=email, otp=otp)
        message_body = textwrap.dedent(f"""
            Halo,
                                        
            Kode OTP kamu adalah: {otp}

            Jangan berikan kode ini kepada siapapun.
        """)
        send_mail(
            subject="Kode Verifikasi Register",
            message=message_body.strip(),
            from_email=None,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({"message": "OTP berhasil dikirim"}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        data = EmailOTP.objects.filter(email=email, otp=otp).first()
        if not data:
            return Response(
                {"valid": False, "message": "OTP salah"}, status=400
            )
        if data.is_used:
            return Response(
                {"valid": False, "message": "OTP sudah digunakan"}, status=400
            )
        if data.is_expired:
            return Response(
                {"valid": False, "message": "OTP sudah kadaluarsa"}, status=400
            )
        data.is_used = True
        data.save()
        return Response({"valid": True, "message": "OTP benar"})


class CheckUsernameView(APIView):
    def post(self, request):
        username = request.data.get("username")

        if User.objects.filter(username=username).exists():
            return Response({"message": "Username sudah ada"}, status=400)
        return Response({"message": "Username tersedia"}, status=200)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        if request.user.userprofile.role != "admin":
            return Response({"message": "Forbidden"}, status=403)

        user = User.objects.filter(id=id).first()
        if not user:
            return Response({"message": "User tidak ditemukan"}, status=404)

        serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User berhasil diupdate"})
        return Response(serializer.errors, status=400)


class AdminSuspendUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.userprofile.role != "admin":
            return Response({"message": "Forbidden"}, status=403)
        
        ids = request.data.get("users", [])
        days = int(request.data.get("days", 15))

        for user in User.objects.filter(id__in=ids):
            if user.userprofile.role == "admin":
                continue
            profile = user.userprofile
            profile.is_suspended = True
            profile.suspended_until = timezone.now() + timedelta(days=days)
            profile.save()
        return Response({"message": "User berhasil disuspend"})


class AdminDeleteUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        if request.user.userprofile.role != "admin":
            return Response({"message": "Forbidden"}, status=403)
        
        ids = request.data.get("users", [])
        users = User.objects.filter(id__in=ids)
        deleted = 0

        for user in users:
            if user.userprofile.role == "admin":
                continue
            user.delete()
            deleted += 1
        return Response({"message": f"{deleted} user berhasil dihapus"})


class AdminOTPListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.userprofile.role != "admin":
            return Response({"error": "Unauthorized"}, status=403)
        
        otp = EmailOTP.objects.all().order_by("-id")
        serializer = EmailOTPSerializer(otp, many=True)
        return Response(serializer.data)


class AdminOTPDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        ids = request.data.get("ids", [])

        EmailOTP.objects.filter(id__in=ids).delete()
        return Response({"message": "OTP berhasil dihapus."})
