from django.urls import path
from . import views

urlpatterns = [
    path('', views.ChannelAPIView.as_view(), name='channels'),
    path('messages/', views.MessageAPIView.as_view(), name='messages'),
    path('channel-command/', views.ChannelCommandAPIView.as_view(), name='channel-command'),
]   