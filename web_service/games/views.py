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
import uuid


class GameListAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    content_negotiation_class = IgnoreClientContentNegotiation
    serializer_class = GameSerializer

    def get(self, request):
        games = Game.objects.all()
        serializer = self.serializer_class(games, many=True)
        return Response(serializer.data)


class InviteAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    content_negotiation_class = IgnoreClientContentNegotiation

    def get(self, request):
        id_ = request.query_params.get("id")
        if not id_:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        return handle_reactive_get(request, "invites", id_)

    def post(self, request):
        from_id = request.data.get("from_id")
        to_id = request.data.get("to_id")
        room_id = request.data.get("room_id")
        if not from_id or not to_id or not room_id:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        data = {
            "status": "pending",
            "from_id": from_id,
            "to_id": to_id,
            "room_id": room_id,
        }

        res = handle_reactive_put("invites", uuid.uuid4(), data)
        handle_reactive_put(
            "ticTacToeScores",
            room_id,
            {"initial": 0},
        )
        handle_reactive_put(
            "ticTacToe",
            room_id,
            {
                "room_id": room_id,
                "last_move": "",
                **{index: "" for index in range(1, 10)},
            },
        )
        return Response(res.reason, status=res.status_code)


class TicTacToeAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    content_negotiation_class = IgnoreClientContentNegotiation

    def get(self, request):
        id_ = request.query_params.get("room_id")
        if not id_:
            return Response(
                status=status.HTTP_400_BAD_REQUEST, data={"error": "No room_id"}
            )
        return handle_reactive_get(request, "ticTacToe", id_)

    def post(self, request):

        res = handle_reactive_put(
            "ticTacToe", request.data.get("room_id"), request.data
        )
        return Response(res.reason, status=res.status_code)


class TicTacToeScoresAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    content_negotiation_class = IgnoreClientContentNegotiation

    def post(self, request):
        room_id = request.data.pop("room_id")
        if not room_id:
            return Response(
                status=status.HTTP_400_BAD_REQUEST, data={"error": "No room_id"}
            )
        if (
            handle_reactive_put("ticTacToeScores", room_id, request.data).status_code
            == 200
        ):
            res = handle_reactive_put(
                "ticTacToe",
                room_id,
                {
                    "room_id": room_id,
                    "last_move": "",
                    **{index: "" for index in range(1, 10)},
                },
            )
            return Response(res.reason, status=res.status_code)
        return Response(
            status=status.HTTP_400_BAD_REQUEST, data={"error": "Failed to update score"}
        )
