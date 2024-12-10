from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Member, Server
from users.models import Profile
from .serializers import (
    MemberSerializer,
    ServerSerializer,
    ServerChannelSerializer,
    ServerChannelMessageSerializer,
)
from users.views import CsrfExemptSessionAuthentication, IgnoreClientContentNegotiation
from django.shortcuts import redirect
import requests
from django.conf import settings

REACTIVE_SERVICE_URL = settings.REACTIVE_SERVICE_URL


class ServerAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        profile_id = request.query_params.get("profile_id")
        if not profile_id:
            return Response(
                "profile_id is required", status=status.HTTP_400_BAD_REQUEST
            )

        if "text/event-stream" in request.headers.get("Accept"):
            resp = requests.post(
                f"{REACTIVE_SERVICE_URL}/streams",
                json={
                    "resource": "profileServers",
                    "params": {"profile_id": profile_id},
                },
            )
            uuid = resp.text

            return redirect(f"/streams/{uuid}", code=307)

        else:
            resp = requests.get(
                f"{REACTIVE_SERVICE_URL}/resources/profileServers",
                params={"profile_id": profile_id},
            )

            if resp.json():
                return Response(resp.json()[0][1], status=status.HTTP_200_OK)
            return Response([], status=status.HTTP_200_OK)

    def post(self, request):
        profile_id = request.data.get("profile_id")
        server_name = request.data.get("server_name")
        if not profile_id or not server_name:
            return Response(
                "profile_id and server_name are required",
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile = Profile.objects.get(id=int(profile_id))
        server = Server.objects.create(name=server_name, owner=profile)
        member = Member.objects.create(profile=profile, role="owner", server=server)

        requests.put(
            f"{REACTIVE_SERVICE_URL}/inputs/servers/{server.id}/",
            json=[
                {"id": str(server.id), "name": server.name, "owner_id": str(profile.id)}
            ],
        )

        requests.put(
            f"{REACTIVE_SERVICE_URL}/inputs/serverMembers/{member.id}/",
            json=[
                {
                    "id": str(member.id),
                    "profile_id": str(profile.id),
                    "role": member.role,
                    "server_id": str(server.id),
                }
            ],
        )

        return Response(ServerSerializer(server).data, status=status.HTTP_201_CREATED)

    def put(self, request):
        pass

    def delete(self, request):
        pass


class MemberAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        pass

    def post(self, request):
        profile_id = request.data.get("profile_id")
        server_name = request.data.get("server_name")
        if not profile_id or not server_name:
            return Response(
                "profile_id and server_name are required",
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            server = Server.objects.get(name=server_name)
        except Server.DoesNotExist:
            return Response(
                "Server does not exist",
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile = Profile.objects.get(id=int(profile_id))
        member = Member.objects.create(profile=profile, role="newbie", server=server)

        requests.put(
            f"{REACTIVE_SERVICE_URL}/inputs/serverMembers/{member.id}/",
            json=[
                {
                    "id": str(member.id),
                    "profile_id": str(profile.id),
                    "role": member.role,
                    "server_id": str(server.id),
                }
            ],
        )

        return Response(MemberSerializer(member).data, status=status.HTTP_201_CREATED)

    def put(self, request):
        pass

    def delete(self, request):
        pass
