from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Member, Server, ServerChannel, ServerChannelMessage, ALL_MEMBER_ROLES, ServerChannelAllowedRole
from users.models import Profile
from .serializers import (
    MemberSerializer,
    ServerSerializer,
    ServerChannelSerializer,
    ServerChannelMessageSerializer,
)
from utils import (
    handle_reactive_get,
    handle_reactive_put,
    CsrfExemptSessionAuthentication,
    IgnoreClientContentNegotiation,
)


class ServerAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        profile_id = request.query_params.get("profile_id")
        if not profile_id:
            return Response(
                "profile_id is required", status=status.HTTP_400_BAD_REQUEST
            )

        return handle_reactive_get(
            request, "profileServers", {"profile_id": profile_id}
        )

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

        # write to input collections
        handle_reactive_put(
            "servers",
            server.id,
            {
                "id": str(server.id),
                "name": server.name,
                "owner_id": str(profile.id),
            },
        )
        handle_reactive_put(
            "serverMembers",
            member.id,
            {
                "id": str(member.id),
                "profile_id": str(profile.id),
                "role": member.role,
                "server_id": str(server.id),
            },
        )

        return Response(ServerSerializer(server).data, status=status.HTTP_201_CREATED)

    def delete(self, request, server_id):
        server = Server.objects.get(id=int(server_id))

        # write to input collections
        resp = handle_reactive_put("servers", server.id, None)
        print(resp.text)

        server.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class MemberAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        server_id = request.query_params.get("server_id")
        profile_id = request.query_params.get("profile_id")
        if not server_id or not profile_id:
            Response(
                "Server id and profile id should be provided",
                status=status.HTTP_400_BAD_REQUEST,
            )

        return handle_reactive_get(
            request, "serverMembers", {"server_id": server_id, "profile_id": profile_id}
        )

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

        # write to input collections
        handle_reactive_put(
            "serverMembers",
            member.id,
            {
                "id": str(member.id),
                "profile_id": str(profile.id),
                "role": member.role,
                "server_id": str(server.id),
            },
        )

        return Response(MemberSerializer(member).data, status=status.HTTP_201_CREATED)

    def patch(self, request, profile_id, server_id):
        member = Member.objects.get(profile_id=profile_id, server_id=server_id)
        new_role = request.data.get("role")
        if not new_role:
            return Response("role is required", status=status.HTTP_400_BAD_REQUEST)

        member.role = new_role
        member.save()

        # write to input collections
        handle_reactive_put(
            "serverMembers",
            member.id,
            {
                "id": str(member.id),
                "profile_id": str(member.profile.id),
                "role": member.role,
                "server_id": str(member.server.id),
            },
        )

        return Response(MemberSerializer(member).data, status=status.HTTP_200_OK)

    def delete(self, request, profile_id, server_id):
        profile = Profile.objects.get(id=int(profile_id))
        server = Server.objects.get(id=int(server_id))
        member = Member.objects.get(profile=profile, server=server)

        # write to input collections
        handle_reactive_put("serverMembers", member.id, None)

        member.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class ServerChannelAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def post(self, request):
        server_id = request.data.get("server_id")
        channel_name = request.data.get("channel_name")
        if not server_id or not channel_name:
            return Response(
                "server_id and channel_name are required",
                status=status.HTTP_400_BAD_REQUEST,
            )

        server = Server.objects.get(id=int(server_id))
        channel = server.channels.create(name=channel_name)

        # write to input collections
        handle_reactive_put(
            "serverChannels",
            channel.id,
            {
                "id": str(channel.id),
                "name": channel.name,
                "server_id": str(server.id),
            },
        )
        for role in ALL_MEMBER_ROLES:
            role_obj = ServerChannelAllowedRole.objects.get(channel=channel, role=role)
            handle_reactive_put(
                "serverChannelAllowedRoles",
                role_obj.id,
                {
                    "id": str(role_obj.id),
                    "channel_id": str(channel.id),
                    "role": role,
                },
            )

        return Response(
            ServerChannelSerializer(channel).data, status=status.HTTP_201_CREATED
        )

    def put(self, request, channel_id):
        new_channel_name = request.data.get("channel_name")
        if not new_channel_name:
            return Response(
                "channel_name is required", status=status.HTTP_400_BAD_REQUEST
            )

        channel = ServerChannel.objects.get(id=channel_id)
        channel.name = new_channel_name
        channel.save()

        # write to input collections
        handle_reactive_put(
            "serverChannels",
            channel.id,
            {
                "id": str(channel.id),
                "name": channel.name,
                "server_id": str(channel.server.id),
            },
        )

        return Response(
            ServerChannelSerializer(channel).data, status=status.HTTP_200_OK
        )

    def delete(self, request, channel_id):
        ServerChannel.objects.get(id=channel_id).delete()

        # write to input collections
        handle_reactive_put("serverChannels", channel_id, None)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ServerChannelMessageAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        channel_id = request.query_params.get("channel_id")
        if not channel_id:
            return Response(
                {"error": "channel_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        return handle_reactive_get(
            request, "serverMessages", {"channel_id": channel_id}
        )

    def post(self, request):
        channel_id = request.data.get("channel_id")
        author_id = request.data.get("author_id")
        content = request.data.get("content")
        if not channel_id or not author_id or not content:
            return Response(
                {"error": "channel_id, author_id and text are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        channel = ServerChannel.objects.get(id=int(channel_id))
        author_profile = Profile.objects.get(id=int(author_id))
        author = Member.objects.get(profile=author_profile, server=channel.server)
        message = ServerChannelMessage.objects.create(
            channel=channel, author=author, content=content
        )

        # write to input collections
        handle_reactive_put(
            "serverMessages",
            message.id,
            {
                "id": str(message.id),
                "channel_id": str(channel.id),
                "author_id": str(author.id),
                "content": message.content,
                "created_at": message.created_at.isoformat(),
            },
        )

        return Response(
            ServerChannelMessageSerializer(message).data, status=status.HTTP_201_CREATED
        )
