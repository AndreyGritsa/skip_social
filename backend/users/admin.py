from django.contrib import admin
from .models import Profile

class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ["id", "user__username"] 
    search_fields = ["user__username"]


# Register your models here.
admin.site.register(Profile, CustomerProfileAdmin)

