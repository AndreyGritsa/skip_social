from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Game
from .serializers import GameSerializer
from utils import (
    handle_reactive_get,
    handle_reactive_put,
    CsrfExemptSessionAuthentication,
    IgnoreClientContentNegotiation,
)

class GameListAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    content_negotiation_class = IgnoreClientContentNegotiation
    serializer_class = GameSerializer

    def get(self, request, format=None):
        games = Game.objects.all()
        serializer = self.serializer_class(games, many=True)
        return Response(serializer.data)
