from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['username', 'status']

    def get_username(self, obj):
        return obj.user.username


class FriendSerialier(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['friends']

    def get_friends(self, obj):
        friends = obj.friends.all()
        return [{'username': friend.user.username, 'status': friend.status} for friend in friends]
