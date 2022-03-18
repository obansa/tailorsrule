from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('shop', views.shop, name='shop'),
    path('shop/<str:category>', views.shop, name='shopF'),
    path('details/<int:product_id>', views.details, name='details'),
    path('wishlist', views.index, name='wishlist'),
    path('cart_api', views.api_cart, name='cartApi'),
    path('cart', views.cart, name='cart'),
]
