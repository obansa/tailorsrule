from django.contrib import admin
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth import get_user_model
from .models import Measurement

admin.site.site_header = "Tailor's Rule Admin"
admin.site.site_title = "Tailor's Rule Admin Portal"
admin.site.index_title = "Welcome to Tailor's Rule Researcher Portal"


class CustomUserAdmin(UserAdmin):
    """Define admin model for custom User model with no username field."""
    fieldsets = (
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'gender', 'country',
                                         'state', 'address', 'profilePic')}),
        (None, {'fields': ('phone', 'email', 'password')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_tailor',
                                       'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'gender', 'password1', 'password2'),
        }),
    )
    list_display = ('phone', 'first_name', 'last_name', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('first_name',)


admin.site.register(get_user_model(), CustomUserAdmin)

admin.site.register(Measurement)

