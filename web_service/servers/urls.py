from django.urls import path
from . import views

urlpatterns = [
    path("", views.ServerAPIView.as_view(), name="servers"),
    path("members/", views.MemberAPIView.as_view(), name="members"),
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
