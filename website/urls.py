"""website URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
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
from django.conf import settings
from django.conf.urls.static import static

# noinspection PyUnresolvedReferences
from TailorsMobile.admin import mobile_admin_site
# noinspection PyUnresolvedReferences
from Store.admin import store_admin_site

urlpatterns = [
    path('admin/', admin.site.urls),
    path('admin@mobile/', mobile_admin_site.urls),
    path('admin@store/', store_admin_site.urls),
    path('', include('MainSite.urls')),
    path('api/', include('TailorsMobile.urls')),
    path('store/', include('Store.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
