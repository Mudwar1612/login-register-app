from django.contrib.auth.models import User
from rest_framework import serializers

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile


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


        data['username'] = self.user.username
        data['email'] = self.user.email
        data['role'] = profile.role


        return data
    
class AdminUserSerializer(serializers.ModelSerializer):

    role = serializers.SerializerMethodField()


    class Meta:

        model = User

        fields = [
            'id',
            'username',
            'email',
            'role'
        ]


    def get_role(self, obj):

        try:
            return obj.userprofile.role

        except UserProfile.DoesNotExist:

            return "user"