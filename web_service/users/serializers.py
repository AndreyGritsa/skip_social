from rest_framework import serializers
from .models import Profile, FriendRequest


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['username', 'status']

    def get_username(self, obj):
        return obj.user.username


class FriendSerializer(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['friends']

    def get_friends(self, obj):
        friends = obj.friends.all()
        return [{'name': friend.user.username, 'status': friend.status, 'id': friend.id} for friend in friends]
    
class FriendRequestSerializer(serializers.ModelSerializer):
    from_profile = serializers.SerializerMethodField()
    to_profile = serializers.SerializerMethodField()

    class Meta:
        model = FriendRequest
        fields = ['from_profile', 'to_profile']

    def get_from_profile(self, obj):
        return obj.from_profile.user.username

    def get_to_profile(self, obj):
        return obj.to_profile.user.username
