from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Profile, FriendRequest
from .serializers import ProfileSerializer, FriendSerializer, FriendRequestSerializer
import requests
from django.http import StreamingHttpResponse


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
    def get(self, request):
        # TODO: for testing purposes no auth here
        profile_id = request.query_params.get('profile_id', None)

        # Normally we would do it like this
        if profile_id is not None:
            try:
                profile = Profile.objects.get(id=int(profile_id))
                serializer = FriendSerializer(profile)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Profile.DoesNotExist:
                return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Profile ID not provided'}, status=status.HTTP_400_BAD_REQUEST)
    
        # # Reactive version ?
        # # Proxy the request to the reactive service
        # proxy_url = f"http://nginx_social/reactive/friends/?profile_id={profile_id}"
        # headers = {
        #     'Host': request.get_host(),
        #     'X-Real-IP': request.META.get('REMOTE_ADDR'),
        #     'X-Forwarded-For': request.META.get('HTTP_X_FORWARDED_FOR'),
        #     'X-Forwarded-Proto': request.scheme,
        # }
        # proxy_response = requests.get(proxy_url, headers=headers, stream=True)
        
        # # Stream the response from the reactive service back to the client
        # return StreamingHttpResponse(
        #     proxy_response.raw,
        #     status=proxy_response.status_code,
        #     content_type=proxy_response.headers.get('Content-Type')
        # )


class FriendRequestAPIView(APIView):
    def get(self, request):
        profile_id = request.query_params.get('profile_id')
        if profile_id is not None:
            try:
                profile = Profile.objects.get(id=int(profile_id))
                friend_requests = FriendRequest.objects.filter(to_profile=profile)
                for friend_request in friend_requests:
                    print(friend_request)
                serializer = FriendRequestSerializer(friend_requests, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Profile.DoesNotExist:
                return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Profile ID not provided'}, status=status.HTTP_400_BAD_REQUEST)

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

    
