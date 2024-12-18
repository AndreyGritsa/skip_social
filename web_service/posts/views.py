from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer
from utils import (
    handle_reactive_get,
    handle_reactive_put,
    CsrfExemptSessionAuthentication,
    IgnoreClientContentNegotiation,
)


class PostAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        profile_id = request.query_params.get("profile_id")
        post_type = request.query_params.get("type")
        if not profile_id or not post_type:
            return Response(
                {"error": "Profile ID or post type not provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resources_name = "friendsPosts" if post_type == "posts" else "authorPosts"
        return handle_reactive_get(request, resources_name, {"profile_id": profile_id})

    def post(self, request):
        profile_id = request.data["profile_id"]
        title = request.data["title"]
        content = request.data["content"]
        if not profile_id or not title or not content:
            return Response(
                {"error": "Profile ID, title or content not provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = {"author": int(profile_id), "title": title, "content": content}

        serializer = PostSerializer(data=data)
        if serializer.is_valid():
            serializer.save()

            collections_data = {**serializer.data, "author_id": profile_id}

            # Write to reactive input collections
            handle_reactive_put("posts", serializer.data["id"], collections_data)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        post = Post.objects.get(pk=pk)
        data = {
            **request.data,
            "author": post.author.id,
        }
        serializer = PostSerializer(post, data=data)
        if serializer.is_valid():
            serializer.save()

            collections_data = {
                **serializer.data,
                "author_id": serializer.data["author"],
            }

            # Write to reactive input collections
            handle_reactive_put("posts", pk, collections_data)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        post = Post.objects.get(pk=pk)
        post.delete()

        # Write to reactive input collections
        handle_reactive_put("posts", pk, None)

        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        post_id = request.query_params.get("post_id")
        if not post_id:
            return Response(
                {"error": "Post ID not provided"}, status=status.HTTP_400_BAD_REQUEST
            )
        return handle_reactive_get(request, "comments", {"post_id": post_id})

    def post(self, request):
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            collections_data = {
                **serializer.data,
                "post_id": str(request.data["post"]),
                "author_id": str(request.data["author"]),
            }

            # write to reactive input collections
            handle_reactive_put("comments", serializer.data["id"], collections_data)

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
