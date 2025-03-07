from rest_framework import serializers
from .models import Profile, FriendRequest


class ProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ["name", "status", "id"]

    def get_name(self, obj):
        return obj.user.username


class FriendSerializer(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ["friends"]

    def get_friends(self, obj):
        friends = obj.friends.all()
        return [
            {"name": friend.user.username, "status": friend.status, "id": friend.id}
            for friend in friends
        ]


class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = "__all__"
