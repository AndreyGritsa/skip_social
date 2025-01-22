from django.urls import path
from . import views


urlpatterns = [
    path('', views.ExternalServiceSubscriptionAPIView.as_view(), name='external-service-subscriptions'),
    path('<int:pk>/', views.ExternalServiceSubscriptionAPIView.as_view(), name='external-service-subscription-update-delete'),
]