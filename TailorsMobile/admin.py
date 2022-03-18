from django.contrib.admin import AdminSite
from .models import *


# Register your models here.

class MobileAdminSite(AdminSite):
    site_header = "Tailor's Rule Mobile Admin"
    site_title = "Tailor's Rule Mobile Admin Portal"
    index_title = "Welcome to Tailor's Rule Mobile Database"


mobile_admin_site = MobileAdminSite(name='mobile_admin')

mobile_admin_site.register(Tailor)
mobile_admin_site.register(Setting)
mobile_admin_site.register(Project)
mobile_admin_site.register(ProjectImage)


