from django.urls import path
from . import views

urlpatterns = [
    path('', views.GameListAPIView.as_view(), name='games'),
]