import random

from django.contrib.auth.models import User
from django.core.mail import send_mail

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status

from .models import EmailOTP, UserProfile
from .serializers import RegisterSerializer, ProfileSerializer, MyTokenObtainPairSerializer, AdminUserSerializer

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            UserProfile.objects.create(
                user=user,
                role='user'
            )
            return Response(
                {
                    "message":
                    "User berhasil dibuat"
                },
                status=status.HTTP_201_CREATED
            )
    
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class SendOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response(
                {
                    "message":"Email wajib diisi"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        otp = str(random.randint(100000,999999))

        EmailOTP.objects.filter(
            email=email
        ).delete()

        EmailOTP.objects.create(
            email=email,
            otp=otp
        )

        send_mail(
            subject="Kode Verifikasi Register",
            message=f"""
            Halo,
            Kode OTP kamu adalah:
            {otp}
            Jangan berikan kode ini kepada siapapun.
            """,
            from_email=None,
            recipient_list=[email]
        )

        return Response(
            {
                "message":"OTP berhasil dikirim"
            },
            status=status.HTTP_200_OK
        )
    
class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        data = EmailOTP.objects.filter(
            email=email,
            otp=otp
        ).first()

        if not data:
            return Response(
                {
                    "valid":False,
                    "message":"OTP salah"
                },
                status=400
            )
        
        if data.is_expired():
            return Response(
                {
                    "message":"OTP sudah kadaluarsa"
                }, 
                status=400
            )

        return Response(
            {
                "valid":True,
                "message":"OTP benar"
            }
        )
    
class CheckUsernameView(APIView):
    def post(self, request):
        username = request.data.get('username')

        if User.objects.filter(username=username).exists():
            return Response(
                {
                    "message":"Username sudah ada"
                },
                status=400
            )

        return Response(
            {
                "message":"Username tersedia"
            },
            status=200
        )

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)

        return Response(serializer.data)
    
    def put(self, request):

        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )

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

        serializer = AdminUserSerializer(
            users,
            many=True
        )

        return Response(
            serializer.data
        )