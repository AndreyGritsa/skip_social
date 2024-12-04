from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer
from users.views import CsrfExemptSessionAuthentication, IgnoreClientContentNegotiation
from django.shortcuts import redirect
import requests
import os

REACTIVE_SERVICE_URL = os.getenv('REACTIVE_SERVICE_URL')


class PostAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        profile_id = request.query_params.get('profile_id')
        post_type = request.query_params.get('type')
        if not profile_id or not post_type:
            return Response({'error': 'Profile ID or post type not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        resources_name = "friendsPosts" if post_type == 'posts' else "authorPosts"
        
        if 'text/event-stream' in request.headers.get('Accept'):
            resp = requests.post(
                f"{REACTIVE_SERVICE_URL}/streams",
                json={
                    'resource': resources_name,
                    'params': {
                        'profile_id': profile_id
                        }
                },
            )
            uuid = resp.text

            return redirect(f"/streams/{uuid}", code=307)

        else:
            resp = requests.get(
                f"{REACTIVE_SERVICE_URL}/resources/{resources_name}", params={'profile_id': profile_id}
            )
            print(f"{resources_name} posts for profile id: {profile_id}")
            print(resp.json())

            if resp.json():
                return Response(resp.json()[0][1], status=status.HTTP_200_OK)
            return Response([], status=status.HTTP_200_OK)

    def post(self, request):
        profile_id = request.data["profile_id"]
        title = request.data["title"]
        content = request.data["content"]
        print(f"Profile ID: {profile_id}, Title: {title}, Content: {content}")
        if not profile_id or not title or not content:
            return Response({'error': 'Profile ID, title or content not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = {
            "author": int(profile_id),
            "title": title,
            "content": content
        }
        
        serializer = PostSerializer(data=data)
        if serializer.is_valid():
            serializer.save()

            collections_data = {
                **serializer.data,
                "author_id": profile_id
            }

            # Write to reactive input collections
            requests.put(
                f"{REACTIVE_SERVICE_URL}/inputs/posts/{serializer.data['id']}",
                json=[collections_data]
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk):
        post = Post.objects.get(pk=pk)
        data = {**request.data, 'author': post.author.id,}
        serializer = PostSerializer(post, data=data)
        if serializer.is_valid():
            serializer.save()

            collections_data = {
                **serializer.data,
                "author_id": serializer.data['author']
            }

            # Write to reactive input collections
            requests.put(
                f"{REACTIVE_SERVICE_URL}/inputs/posts/{pk}",
                json=[collections_data]
            )

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        post = Post.objects.get(pk=pk)
        post.delete()

        requests.put(
            f"{REACTIVE_SERVICE_URL}/inputs/posts/{pk}",
            json=[]
        )

        return Response(status=status.HTTP_204_NO_CONTENT)
    

class CommentAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    # def get(self, request):
    #     comments = Comment.objects.all()
    #     serializer = CommentSerializer(comments, many=True)
    #     return Response(serializer.data)

    def post(self, request):
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            collections_data = {
                **serializer.data,
                "post_id": str(request.data['post']),
                "author_id": str(request.data['author'])
            }

            # write to reactive input collections
            requests.put(
                f"{REACTIVE_SERVICE_URL}/inputs/comments/{serializer.data['id']}",
                json=[collections_data]
            )


            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # def put(self, request, pk):
    #     comment = Comment.objects.get(pk=pk)
    #     serializer = CommentSerializer(comment, data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # def delete(self, request, pk):
    #     comment = Comment.objects.get(pk=pk)
    #     comment.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)