from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('shop', views.shop, name='shop'),
    path('shop/<str:categories>', views.shop, name='shopF'),
    path('shop', views.shop, name='shopF2'),
    path('api_filter', views.api_filter, name='filter'),
    path('quick_look', views.api_quick_look, name='quick_look'),
    path('details/<int:product_id>', views.details, name='details'),
    path('wishlist', views.wish_list, name='wishlist'),
    path('cart_api', views.api_cart, name='cartApi'),
    path('wishlist_api', views.api_wish_list, name='wishlistApi'),
    path('cart', views.cart, name='cart'),
    path('api_sign_in', views.api_sign_in),
    path('m_cart', views.m_cart),
]
