"""
URL configuration for app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from .views import HealthAPIView

admin.site.site_header = "Reactive Social Admin"
admin.site.index_title = "Reactive Social features area"
admin.site.site_title = "Reactive Social Admin"

urlpatterns = [
    path("api/health/", HealthAPIView.as_view(), name="health"),
    path("api/admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/posts/", include("posts.urls")),
    path("api/channels/", include("channels.urls")),
    path("api/servers/", include("servers.urls")),
    path("api/externals/", include("externals.urls")),
    path("api/games/", include("games.urls")),
]
