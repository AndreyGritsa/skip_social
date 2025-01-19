from django.db import models
from users.models import Profile

class ExternalServiceSubscription(models.Model):
    type = models.CharField(max_length=100)
    query_params = models.JSONField()
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.profile.user.username} - {self.type}"
