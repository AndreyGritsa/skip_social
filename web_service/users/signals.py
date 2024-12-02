from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile, FriendRequest

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

@receiver(post_save, sender=FriendRequest)
def create_friendship(sender, instance, created, **kwargs):
    if created:
        # Check if a reciprocal friend request exists
        reciprocal_request = FriendRequest.objects.filter(
            from_profile=instance.to_profile,
            to_profile=instance.from_profile
        ).exists()

        if reciprocal_request:
            # Add each profile to the other's friends list
            instance.from_profile.friends.add(instance.to_profile)
            instance.to_profile.friends.add(instance.from_profile)