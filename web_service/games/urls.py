from django.urls import path
from . import views

urlpatterns = [
    path("", views.GameListAPIView.as_view(), name="games"),
    path("invites/", views.InviteAPIView.as_view(), name="invites"),
    path("tictactoe/", views.TicTacToeAPIView.as_view(), name="tictactoe"),
    path(
        "tictactoe/score/",
        views.TicTacToeScoresAPIView.as_view(),
        name="tictactoe-score",
    ),
]
