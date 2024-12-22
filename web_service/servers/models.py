from django.db import models
from users.models import Profile

ALL_MEMBER_ROLES = ["owner", "admin", "newbie"]


class Server(models.Model):
    name = models.CharField(max_length=255, unique=True)
    owner = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="owned_servers"
    )

    def __str__(self):
        return f"{self.name} - {self.owner.user.username}"


class Member(models.Model):
    ROLE_CHOICES = [(role, role) for role in ALL_MEMBER_ROLES]
    
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="servers"
    )
    role = models.CharField(max_length=255, choices=ROLE_CHOICES)
    server = models.ForeignKey(Server, on_delete=models.CASCADE, related_name="members")

    class Meta:
        unique_together = ("profile", "server")

    def __str__(self):
        return f"{self.profile.user.username}, {self.role} - {self.server.name}"


class ServerChannel(models.Model):
    name = models.CharField(max_length=255)
    server = models.ForeignKey(
        Server, on_delete=models.CASCADE, related_name="channels"
    )

    def __str__(self):
        return self.name


class ServerChannelMessage(models.Model):
    content = models.TextField()
    author = models.ForeignKey(
        Member, on_delete=models.CASCADE, related_name="messages"
    )
    channel = models.ForeignKey(
        ServerChannel, on_delete=models.CASCADE, related_name="messages"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content
    
class ServerChannelAllowedRole(models.Model):
    channel = models.ForeignKey(ServerChannel, on_delete=models.CASCADE, related_name="allowed_roles")
    role = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.role} - {self.channel.name}"
