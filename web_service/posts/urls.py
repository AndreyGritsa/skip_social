from django.urls import path
from . import views

urlpatterns = [
    path('', views.PostAPIView.as_view(), name='posts'),
    path('<int:pk>/', views.PostAPIView.as_view(), name='post-update-delete'),
    path('comments/', views.CommentAPIView.as_view(), name='comments'),
    path('comments/<int:pk>/', views.CommentAPIView.as_view(), name='comment-update-delete'),
]