from django.urls import path
from . import views

urlpatterns = [
    path('', views.PostAPIView.as_view(), name='posts'),
]