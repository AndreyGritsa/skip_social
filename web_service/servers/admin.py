from django.contrib import admin
from .models import Server, Member, ServerChannel, ServerChannelMessage

admin.site.register(Server)
admin.site.register(Member)
admin.site.register(ServerChannel)
admin.site.register(ServerChannelMessage)
