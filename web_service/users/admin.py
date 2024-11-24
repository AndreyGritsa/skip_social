from django.contrib import admin
from .models import Profile, FriendRequest

class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ["id", "user__username"] 
    search_fields = ["user__username"]


# Register your models here.
admin.site.register(Profile, CustomerProfileAdmin)
admin.site.register(FriendRequest)

