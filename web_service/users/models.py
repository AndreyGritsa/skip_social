from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


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
    

class FriendRequest(models.Model):
    from_profile = models.ForeignKey(Profile, related_name='sent_requests', on_delete=models.CASCADE)
    to_profile = models.ForeignKey(Profile, related_name='received_requests', on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['from_profile', 'to_profile'], name='unique_friend_request')
        ]

    def __str__(self):
        return f"From {self.from_profile.user.username} to {self.to_profile.user.username}"
    
    def clean(self):
        if self.from_profile == self.to_profile:
            raise ValidationError("A profile cannot send a friend request to itself.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

