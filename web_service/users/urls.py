from django.urls import path
from . import views

urlpatterns = [
    path("", views.UserAPIView.as_view(), name="user"),
    path("friend", views.FriendAPIView.as_view(), name="friend"),
    path("friend/request", views.FriendRequestAPIView.as_view(), name="friend_request"),
    path("users/", views.UserListAPIView.as_view(), name="user_list"),
]
