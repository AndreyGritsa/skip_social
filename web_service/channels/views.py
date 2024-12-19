from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Channel, Message
from users.models import Profile
from .serializers import ChannelSerializer, MessageSerializer
from utils import (
    handle_reactive_get,
    handle_reactive_put,
    CsrfExemptSessionAuthentication,
    IgnoreClientContentNegotiation,
)
from django.db import models


class ChannelAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        profile_id = request.query_params.get("profile_id")
        if not profile_id:
            return Response(
                {"error": "profile_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        return handle_reactive_get(request, "channels", {"profile_id": profile_id})

    def post(self, request):
        profile_id = request.data.get("profile_id")
        participant_id = request.data.get("participant_id")
        if not profile_id or not participant_id:
            return Response(
                {"error": "profile_id and participant_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile = Profile.objects.get(id=int(profile_id))
        participant = Profile.objects.get(id=int(participant_id))
        # Check if a channel with the same participants already exists
        existing_channels = Channel.objects.annotate(
            num_participants=models.Count("participants")
        ).filter(num_participants=2)

        for channel in existing_channels:
            if set(channel.participants.all()) == {profile, participant}:
                # Channel with the same participants already exists
                return Response("Channel already exists", status=status.HTTP_200_OK)
        else:
            # Create a new channel if no existing channel is found
            new_channel = Channel.objects.create()
            new_channel.participants.add(profile, participant)
            new_channel.save()

        # Access the intermediary table
        ChannelParticipants = Channel.participants.through
        participant_1 = ChannelParticipants.objects.filter(
            channel=new_channel, profile=profile
        ).first()
        participant_2 = ChannelParticipants.objects.filter(
            channel=new_channel, profile=participant
        ).first()

        # write to input collections
        handle_reactive_put(
            "channelParticipants",
            participant_1.id,
            {
                "id": str(participant_1.id),
                "profile_id": str(participant_1.profile.id),
                "channel_id": str(new_channel.id),
            },
        )
        handle_reactive_put(
            "channelParticipants",
            participant_2.id,
            {
                "id": str(participant_2.id),
                "profile_id": str(participant_2.profile.id),
                "channel_id": str(new_channel.id),
            },
        )
        return Response(
            ChannelSerializer(new_channel).data, status=status.HTTP_201_CREATED
        )


class MessageAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        channel_id = request.query_params.get("channel_id")
        if not channel_id:
            return Response(
                {"error": "channel_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        return handle_reactive_get(request, "messages", {"channel_id": channel_id})

    def post(self, request):
        channel_id = request.data.get("channel_id")
        author_id = request.data.get("author_id")
        content = request.data.get("content")
        if not channel_id or not author_id or not content:
            return Response(
                {"error": "channel_id, author_id and text are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        channel = Channel.objects.get(id=int(channel_id))
        author = Profile.objects.get(id=int(author_id))
        message = Message.objects.create(
            channel=channel, author=author, content=content
        )

        # write to input collections
        handle_reactive_put(
            "messages",
            message.id,
            {
                "id": str(message.id),
                "channel_id": str(channel.id),
                "author_id": str(author.id),
                "content": message.content,
                "created_at": message.created_at.isoformat(),
            },
        )

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
