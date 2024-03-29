# noinspection PyUnresolvedReferences
from MainSite.models import CustomUser
from rest_framework import serializers
from .models import Cart, Product, WishList


class CartSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(many=False, slug_field='phone', queryset=CustomUser.objects.all())
    product = serializers.SlugRelatedField(many=False, slug_field='id', queryset=Product.objects.all())

    class Meta:
        model = Cart
        fields = ['user', 'product', 'quantity', 'size']


class WishListSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(many=False, slug_field='phone', queryset=CustomUser.objects.all())
    product = serializers.SlugRelatedField(many=False, slug_field='id', queryset=Product.objects.all())

    class Meta:
        model = WishList
        fields = ['user', 'product']
