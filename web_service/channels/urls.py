from django.urls import path
from . import views

urlpatterns = [
    path('', views.ChannelAPIView.as_view(), name='channels'),
]