from .models import ExternalServiceSubscription
from rest_framework import serializers


class ExternalServiceSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalServiceSubscription
        fields = "__all__"