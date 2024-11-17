from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('away', 'Away'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='online')
    friends = models.ManyToManyField('self', blank=True)

    def __str__(self):
        return self.user.username

