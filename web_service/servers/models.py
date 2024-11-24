from django.db import models
from users.models import Profile


class Server(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Member(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='servers')
    role = models.CharField(max_length=255)
    server = models.ForeignKey(Server, on_delete=models.CASCADE, related_name='members')

    def __str__(self):
        return self.profile.user.username