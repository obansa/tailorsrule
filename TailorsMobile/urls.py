from django.urls import path
from . import views
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('user', views.user_get),
    path('customers', views.customers, name='customers'),
    path('measure', views.measurement, name='measurement'),
    path('project', views.project, name='project'),
    path('project_image', views.project_image, name='project_image'),
    path('settings', views.settings, name='settings'),
    path('login', obtain_auth_token, name='login'),

]
