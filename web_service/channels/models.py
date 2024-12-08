from django.db import models
from users.models import Profile
from django.core.exceptions import ValidationError

class Channel(models.Model):
    participants = models.ManyToManyField(Profile, related_name='channels')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Channel {self.id} - Participants: {self.participants.first()} and {self.participants.last()}"
    
    def save(self, *args, **kwargs):
        if self.pk is None:  # Only check for new channels
            existing_channels = Channel.objects.annotate(
                num_participants=models.Count('participants')
            ).filter(num_participants=self.participants.count())

            for channel in existing_channels:
                if set(channel.participants.all()) == set(self.participants.all()):
                    raise ValidationError("A channel with the same participants already exists.")
        
        super().save(*args, **kwargs)
    
class Message(models.Model):
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(Profile, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message {self.id} by {self.author} in Channel {self.channel.id}"
