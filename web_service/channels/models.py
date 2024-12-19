from django.db import models
from users.models import Profile


class Channel(models.Model):
    participants = models.ManyToManyField(Profile, related_name="channels")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Channel {self.id} - Participants: {self.participants.first()} and {self.participants.last()}"


class Message(models.Model):
    channel = models.ForeignKey(
        Channel, on_delete=models.CASCADE, related_name="messages"
    )
    author = models.ForeignKey(Profile, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message {self.id} by {self.author} in Channel {self.channel.id}"
