from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserAPIView.as_view(), name='user'),
    path('friend/', views.FriendAPIView.as_view(), name='friend')
]