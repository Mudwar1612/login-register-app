from django.urls import path

from .views import (
    RegisterView, 
    ProfileView, 
    SendOTPView, 
    VerifyOTPView, 
    CheckUsernameView, 
    AdminUserListView
    )

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('send-otp/', SendOTPView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('check-username/', CheckUsernameView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('admin/users/', AdminUserListView.as_view()),
]