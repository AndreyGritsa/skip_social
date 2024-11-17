from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Profile
from .serializers import ProfileSerializer, FriendSerialier
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


class FriendAPIView(APIView):
    def get(self, request):
        # TODO: for testing purposes no auth here
        profile_id = request.query_params.get('profile_id', None)

        # Normally we would do it like this
        # if profile_id is not None:
        #     try:
        #         profile = Profile.objects.get(id=profile_id)
        #         serializer = FriendSerialier(profile)
        #         return Response(serializer.data, status=status.HTTP_200_OK)
        #     except Profile.DoesNotExist:
        #         return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        # return Response({'error': 'Profile ID not provided'}, status=status.HTTP_400_BAD_REQUEST)
    
        # Reactive version ?
        # Proxy the request to the reactive service
        proxy_url = f"http://nginx_social/reactive/friends/?profile_id={profile_id}"
        headers = {
            'Host': request.get_host(),
            'X-Real-IP': request.META.get('REMOTE_ADDR'),
            'X-Forwarded-For': request.META.get('HTTP_X_FORWARDED_FOR'),
            'X-Forwarded-Proto': request.scheme,
        }
        proxy_response = requests.get(proxy_url, headers=headers, stream=True)
        
        # Stream the response from the reactive service back to the client
        return StreamingHttpResponse(
            proxy_response.raw,
            status=proxy_response.status_code,
            content_type=proxy_response.headers.get('Content-Type')
        )

    
