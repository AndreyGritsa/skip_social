from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ExternalServiceSubscription
from users.models import Profile
from .serializers import ExternalServiceSubscriptionSerializer
from utils import (
    handle_reactive_get,
    handle_reactive_put,
    CsrfExemptSessionAuthentication,
    IgnoreClientContentNegotiation,
)

SUBSCRIPTION_TYPES = ["externals", "weather", "crypto"]


class ExternalServiceSubscriptionAPIView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        profile_id = request.query_params.get("profile_id")
        subscription_type = request.query_params.get("type")
        id = request.query_params.get("id")
        if (
            not profile_id
            or not subscription_type
            or subscription_type not in SUBSCRIPTION_TYPES
        ):
            return Response(
                {"error": "Profile ID or subscription type not provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "text/event-stream" not in request.headers.get("Accept", ""):
            return Response(
                [0, [{"error": "Skip non-streaming requests"}]],
                status=status.HTTP_200_OK,
            )

        if subscription_type == "externals":
            params = profile_id
        else:
            params = id

        return handle_reactive_get(request, subscription_type, params)

    def post(self, request):
        profile_id = request.data["profile_id"]
        type = request.data["type"]
        query_params = request.data["params"]
        if not profile_id or not type or not query_params:
            return Response(
                {"error": "Profile ID, type or query params not provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile = Profile.objects.get(pk=int(profile_id))

        if ExternalServiceSubscription.objects.filter(
            profile=profile, query_params=query_params
        ).exists():
            return Response(
                {"error": "Subscription already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = {"profile": profile.pk, "type": type, "query_params": query_params}

        serializer = ExternalServiceSubscriptionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()

            collections_data = {**serializer.data, "profile_id": profile_id}

            handle_reactive_put(
                "externalServiceSubscriptions",
                str(serializer.data["id"]),
                collections_data,
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        subscription = ExternalServiceSubscription.objects.get(pk=pk)
        data = {
            "type": request.data.get("type", subscription.type),
            "query_params": request.data.get("query_params", subscription.query_params),
            "user": subscription.user,
        }

        serializer = ExternalServiceSubscriptionSerializer(subscription, data=data)
        if serializer.is_valid():
            serializer.save()

            collections_data = {**serializer.data, "user_id": subscription.user_id}

            handle_reactive_put("externalServiceSubscriptions", pk, collections_data)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        subscription = ExternalServiceSubscription.objects.get(pk=int(pk))
        subscription.delete()
        
        handle_reactive_put("externalServiceSubscriptions", pk, None)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
