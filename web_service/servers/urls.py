from django.urls import path
from . import views

urlpatterns = [
    path("", views.ServerAPIView.as_view(), name="servers"),
    path("<int:server_id>/", views.ServerAPIView.as_view(), name="servers-detail"),
    path("members/", views.MemberAPIView.as_view(), name="members"),
    path(
        "members/<int:profile_id>/<int:server_id>/",
        views.MemberAPIView.as_view(),
        name="members-detail",
    ),
    path("channels/", views.ServerChannelAPIView.as_view(), name="server-channels"),
    path(
        "channels/<int:channel_id>/",
        views.ServerChannelAPIView.as_view(),
        name="server-channels-detail",
    ),
    path(
        "messages/",
        views.ServerChannelMessageAPIView.as_view(),
        name="server-channel-messages",
    ),
]
