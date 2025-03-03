from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Profile, FriendRequest
from .serializers import ProfileSerializer, FriendRequestSerializer
from utils import (
    handle_reactive_get,
    CsrfExemptSessionAuthentication,
    IgnoreClientContentNegotiation,
)


class UserAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        # TODO: for testing purposes no auth here
        profile_id = request.query_params.get("profile_id", None)
        if not profile_id:
            return Response(
                {"error": "Profile ID not provided"}, status=status.HTTP_400_BAD_REQUEST
            )
        return handle_reactive_get(request, "modifiedProfiles", profile_id)

    def patch(self, request):
        # TODO: for testing purposes no auth here
        data = request.data
        if "profile_id" in data and "status" in data:
            try:
                profile_id = int(data["profile_id"])

                profile = Profile.objects.get(id=profile_id)
                profile.status = data["status"]
                profile.save()
                serializer = ProfileSerializer(profile)

                return Response(serializer.data, status=status.HTTP_200_OK)
            except Profile.DoesNotExist:
                return Response(
                    {"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"error": "Profile ID or status not provided"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class FriendAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        # TODO: for testing purposes no auth here
        profile_id = request.query_params.get("profile_id", None)
        if not profile_id:
            return Response(
                {"error": "Profile ID not provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        return handle_reactive_get(request, "friends", profile_id)

    # TODO: for testing purposes put but should be delete
    def put(self, request):
        profile_id = request.data["profile_id"]
        friend_id = request.data["friend_id"]
        if not profile_id or not friend_id:
            return Response(
                {"error": "Profile ID or friend ID not provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile = Profile.objects.get(id=int(profile_id))
        friend = Profile.objects.get(id=int(friend_id))
        if friend in profile.friends.all():
            profile.friends.remove(friend)
            friend.friends.remove(profile)
            friend.save()
            profile.save()
            serializer = ProfileSerializer(profile)

            FriendRequest.objects.get(from_profile=profile, to_profile=friend).delete()
            FriendRequest.objects.get(from_profile=friend, to_profile=profile).delete()

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"error": "Friend not found"}, status=status.HTTP_404_NOT_FOUND)


class FriendRequestAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        profile_id = request.query_params.get("profile_id")
        if not profile_id:
            return Response(
                {"error": "Profile ID not provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        return handle_reactive_get(request, "friendRequestsTo", profile_id)

    def post(self, request):
        to_profile = request.data.get("to_profile")
        # TODO: for testing purposes no auth here
        profile_id = request.data.get("from_profile")
        if to_profile and profile_id:
            try:
                profile_from = Profile.objects.get(id=int(profile_id))
                profile_to = Profile.objects.get(user__username=to_profile)

                # Check if they are already friends
                if profile_to in profile_from.friends.all():
                    return Response(
                        {"error": "Profiles are already friends"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Check if a friend request already exists
                if FriendRequest.objects.filter(
                    from_profile=profile_from, to_profile=profile_to
                ).exists():
                    return Response(
                        {"error": "Friend request already sent"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                friend_request = FriendRequest.objects.create(
                    from_profile=profile_from, to_profile=profile_to
                )
                serializer = FriendRequestSerializer(friend_request)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Profile.DoesNotExist:
                return Response(
                    {"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"error": "Profile ID or username not provided"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, profile_id, friend_id):
        profile = Profile.objects.get(id=int(profile_id))
        friend = Profile.objects.get(id=int(friend_id))
        if FriendRequest.objects.filter(
            from_profile=profile, to_profile=friend
        ).exists():
            FriendRequest.objects.get(from_profile=profile, to_profile=friend).delete()
            return Response(status=status.HTTP_200_OK)
        return Response(
            {"error": "Friend request not found"}, status=status.HTTP_404_NOT_FOUND
        )


class UserListAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        profiles = Profile.objects.all()
        serializer = ProfileSerializer(profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
