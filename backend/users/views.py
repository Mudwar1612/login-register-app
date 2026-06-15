from django.contrib.auth.models import User

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from.serializers import RegisterSerializer

class RegisterView(APIView):


    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )


        if serializer.is_valid():

            serializer.save()


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
    
class ProfileView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    def get(self, request):

        user = request.user


        return Response({

            "username":
            user.username,


            "email":
            user.email

        })