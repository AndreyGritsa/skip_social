from rest_framework import serializers
from .models import Member, Server, ServerChannel, ServerChannelMessage

class ServerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Server
        fields = '__all__'

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'

class ServerChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServerChannel
        fields = '__all__'

class ServerChannelMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServerChannelMessage
        fields = '__all__'