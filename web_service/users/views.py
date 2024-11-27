from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Profile, FriendRequest
from .serializers import ProfileSerializer, FriendRequestSerializer
import requests
import os
from django.shortcuts import redirect
from rest_framework.negotiation import BaseContentNegotiation

REACTIVE_SERVICE_URL = os.getenv('REACTIVE_SERVICE_URL')


class IgnoreClientContentNegotiation(BaseContentNegotiation):
    # TODO: Find better sollution to accept text/event-stream
    def select_parser(self, request, parsers):
        """
        Select the first parser in the `.parser_classes` list.
        """
        return parsers[0]

    def select_renderer(self, request, renderers, format_suffix):
        """
        Select the first renderer in the `.renderer_classes` list.
        """
        return (renderers[0], renderers[0].media_type)


class UserAPIView(APIView):
    def get(self, request):
        # TODO: for testing purposes no auth here
        profile_id = request.query_params.get('profile_id', None)
        if profile_id is not None:
            try:
                profile = Profile.objects.get(id=profile_id)
                serializer = ProfileSerializer(profile)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Profile.DoesNotExist:
                return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Profile ID not provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):
        # TODO: for testing purposes no auth here
        data = request.data
        if 'profile_id' in data and 'status' in data:
            print(f"profile_id: {data['profile_id']}, new_status: {data['status']}")
            try:
                profile_id = int(data['profile_id'])
               
                profile = Profile.objects.get(id=profile_id)
                profile.status = data['status']
                profile.save()
                serializer = ProfileSerializer(profile)

                # Write to reactive collections
                # requests.put()

                return Response(serializer.data, status=status.HTTP_200_OK)
            except Profile.DoesNotExist:
                return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Profile ID or status not provided'}, status=status.HTTP_400_BAD_REQUEST)


class FriendAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    def get(self, request):
        # TODO: for testing purposes no auth here
        profile_id = request.query_params.get('profile_id', None)
        if not profile_id:
            return Response({'error': 'Profile ID not provided'}, status=status.HTTP_400_BAD_REQUEST)

        if 'text/event-stream' in request.headers.get('Accept'):
            resp = requests.post(
                f"{REACTIVE_SERVICE_URL}/streams",
                json={
                    'resource': "friends",
                    'params': {
                        'profile_id': profile_id
                        }
                },
            )
            uuid = resp.text

            return redirect(f"/streams/{uuid}", code=307)

        else:
            resp = requests.get(
                f"{REACTIVE_SERVICE_URL}/resources/friends", params={'profile_id': profile_id}
            )
            print(resp.json()[0][1])
            return Response(resp.json()[0][1], status=status.HTTP_200_OK)


class FriendRequestAPIView(APIView):
    def get(self, request):
        profile_id = request.query_params.get('profile_id')
        if not profile_id:
            return Response({'error': 'Profile ID not provided'}, status=status.HTTP_400_BAD_REQUEST)

        if 'text/event-stream' in request.headers.get('Accept'):
            resp = requests.post(
                f"{REACTIVE_SERVICE_URL}/streams",
                json={
                    'resource': "onesidefriendrequests",
                    'params': {
                        'profile_id': profile_id
                        }
                },
            )
            uuid = resp.text

            return redirect(f"/streams/{uuid}", code=307)

        else:
            resp = requests.get(
                f"{REACTIVE_SERVICE_URL}/resources/onesidefriendrequests", params={'profile_id': profile_id}
            )
            print(resp.json()[0][1])
            return Response(resp.json()[0][1], status=status.HTTP_200_OK)

    def post(self, request):
        to_profile = request.data.get("to_profile")
        # TODO: for testing purposes no auth here
        profile_id = request.data.get('from_profile')
        if to_profile is not None and profile_id is not None:
            try:
                profile_from = Profile.objects.get(id=int(profile_id))
                profile_to = Profile.objects.get(user__username=to_profile)

                # Check if they are already friends
                if profile_to in profile_from.friends.all():
                    return Response({'error': 'Profiles are already friends'}, status=status.HTTP_400_BAD_REQUEST)

                # Check if a friend request already exists
                if FriendRequest.objects.filter(from_profile=profile_from, to_profile=profile_to).exists():
                    return Response({'error': 'Friend request already sent'}, status=status.HTTP_400_BAD_REQUEST)

                friend_request = FriendRequest.objects.create(from_profile=profile_from, to_profile=profile_to)
                serializer = FriendRequestSerializer(friend_request)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Profile.DoesNotExist:
                return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Profile ID or username not provided'}, status=status.HTTP_400_BAD_REQUEST)

    
