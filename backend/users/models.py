from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User

class EmailOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email
    
    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=3)
    
class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('user','User'),
        ('admin','Admin'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )


    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='user'
    )


    def __str__(self):
        return self.user.username