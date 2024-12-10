from django.urls import path
from . import views

urlpatterns = [
    path("", views.ServerAPIView.as_view(), name="servers"),
    path("members/", views.MemberAPIView.as_view(), name="members"),
]
