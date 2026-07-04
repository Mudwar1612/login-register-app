from django.contrib.auth.models import User
from rest_framework import serializers
from django.utils import timezone
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile, EmailOTP


class RegisterSerializer(serializers.ModelSerializer) :
    password = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        return user
    
class ProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['username', 'email', 'role']

    def get_role(self,obj):
        return obj.userprofile.role

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):

        data = super().validate(attrs)

        profile = UserProfile.objects.get(
            user=self.user
        )

        # Cek apakah user sedang disuspend
        if profile.is_suspended:
            if profile.suspended_until > timezone.now():
                raise AuthenticationFailed(
                    f"Akun sedang disuspend sampai {profile.suspended_until}"
                )
            
            # Jika masa suspend sudah habis
            profile.is_suspended = False
            profile.suspended_until = None
            profile.save()

        data['username'] = self.user.username
        data['email'] = self.user.email
        data['role'] = profile.role

        return data
    
class AdminUserSerializer(serializers.ModelSerializer):

    role = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
            'status'
        ]


    def get_role(self, obj):
        try:
            return obj.userprofile.role
        except AttributeError:
            return "user"
        except UserProfile.DoesNotExist:
            return "user"
        
    def get_status(self, obj):
        profile = obj.userprofile
        if profile.is_suspended:
            if profile.suspended_until > timezone.now():
                return "Suspended"
            profile.is_suspended = False
            profile.suspended_until = None
            profile.save()
        return "Active"
        
class EmailOTPSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailOTP

        fields = [
            'id',
            'email',
            'otp',
            'created_at'
        ]

class AdminUserUpdateSerializer(serializers.ModelSerializer):

    role = serializers.CharField(
        source='userprofile.role'
    )

    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = User

        fields = [
            'username',
            'email',
            'password',
            'role'
        ]

    def update(self, instance, validated_data):

        profile_data = validated_data.pop(
            'userprofile',
            {}
        )

        password = validated_data.pop(
            'password',
            None
        )

        instance.username = validated_data.get(
            'username',
            instance.username
        )

        instance.email = validated_data.get(
            'email',
            instance.email
        )

        if password:
            instance.set_password(password)

        instance.save()

        profile = instance.userprofile

        profile.role = profile_data.get(
            'role',
            profile.role
        )

        profile.save()

        return instance