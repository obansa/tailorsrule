from django.contrib.admin import AdminSite
from django.contrib import admin
from .models import *


# Register your models here.

class StoreAdminSite(AdminSite):
    site_header = "Tailor's Rule Store Admin"
    site_title = "Tailor's Rule Store Admin Portal"
    index_title = "Welcome to Tailor's Rule Store Database"


store_admin_site = StoreAdminSite(name='store_admin')

store_admin_site.register(Category)
store_admin_site.register(Product)
store_admin_site.register(ProductsImage)
store_admin_site.register(Cart)
