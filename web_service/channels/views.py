from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.views import CsrfExemptSessionAuthentication, IgnoreClientContentNegotiation
from django.shortcuts import redirect
from .models import Channel, Message
from users.models import Profile
from .serializers import ChannelSerializer, MessageSerializer
import requests
from django.conf import settings

REACTIVE_SERVICE_URL = settings.REACTIVE_SERVICE_URL


class ChannelAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        profile_id = request.query_params.get("profile_id")
        if not profile_id:
            return Response(
                {"error": "profile_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        if "text/event-stream" in request.headers.get("Accept"):
            resp = requests.post(
                f"{REACTIVE_SERVICE_URL}/streams",
                json={"resource": "channels", "params": {"profile_id": profile_id}},
            )
            uuid = resp.text

            return redirect(f"/streams/{uuid}", code=307)

        else:
            resp = requests.get(
                f"{REACTIVE_SERVICE_URL}/resources/channels",
                params={"profile_id": profile_id},
            )

            if resp.json():
                return Response(resp.json()[0][1], status=status.HTTP_200_OK)
            return Response([], status=status.HTTP_200_OK)

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
        channel = Channel.objects.create()
        channel.participants.add(profile, participant)
        channel.save()

        # Access the intermediary table
        ChannelParticipants = Channel.participants.through
        participant_1 = ChannelParticipants.objects.filter(
            channel=channel, profile=profile
        ).first()
        participant_2 = ChannelParticipants.objects.filter(
            channel=channel, profile=participant
        ).first()

        # write to input collections
        requests.put(
            f"{REACTIVE_SERVICE_URL}/inputs/channelParticipants/{participant_1.id}",
            json=[
                {
                    "id": str(participant_1.id),
                    "profile_id": str(participant_1.profile.id),
                    "channel_id": str(channel.id),
                }
            ],
        )
        requests.put(
            f"{REACTIVE_SERVICE_URL}/inputs/channelParticipants/{participant_2.id}",
            json=[
                {
                    "id": str(participant_2.id),
                    "profile_id": str(participant_2.profile.id),
                    "channel_id": str(channel.id),
                }
            ],
        )

        return Response(ChannelSerializer(channel).data, status=status.HTTP_201_CREATED)


class MessageAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        channel_id = request.query_params.get("channel_id")
        if not channel_id:
            return Response(
                {"error": "channel_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        if "text/event-stream" in request.headers.get("Accept"):
            resp = requests.post(
                f"{REACTIVE_SERVICE_URL}/streams",
                json={"resource": "messages", "params": {"channel_id": channel_id}},
            )
            uuid = resp.text

            return redirect(f"/streams/{uuid}", code=307)

        else:
            resp = requests.get(
                f"{REACTIVE_SERVICE_URL}/resources/messages",
                params={"channel_id": channel_id},
            )

            if resp.json():
                return Response(resp.json()[0][1], status=status.HTTP_200_OK)
            return Response([], status=status.HTTP_200_OK)

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
        requests.put(
            f"{REACTIVE_SERVICE_URL}/inputs/messages/{message.id}",
            json=[
                {
                    "id": str(message.id),
                    "channel_id": str(channel.id),
                    "author_id": str(author.id),
                    "content": message.content,
                    "created_at": message.created_at.isoformat(),
                }
            ],
        )

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
