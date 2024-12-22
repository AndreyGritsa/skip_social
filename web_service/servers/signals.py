from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ServerChannel, ServerChannelAllowedRole, ALL_MEMBER_ROLES

@receiver(post_save, sender=ServerChannel)
def create_server_channel_allowed_role(sender, instance, created, **kwargs):
    if created:
        for role in ALL_MEMBER_ROLES:
            ServerChannelAllowedRole.objects.create(channel=instance, role=role)