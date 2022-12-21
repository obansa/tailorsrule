from django.db import models
# noinspection PyUnresolvedReferences
from MainSite.models import CustomUser

# Create your models here.


class Category(models.Model):
    name = models.CharField(max_length=20)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True)
    image = models.ImageField(upload_to='site', null=True, blank=True)

    def __str__(self):
        if self.parent is None:
            return self.name
        else:
            return str(self.parent)+'--'+self.name


class Product(models.Model):
    name = models.CharField(max_length=50)
    discount = models.CharField(max_length=10)
    price = models.CharField(max_length=10)
    stock_amount = models.CharField(max_length=20)
    amount_left = models.CharField(max_length=20)
    description = models.TextField(max_length=1000)
    information = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    color = models.TextField()
    size = models.TextField()
    amount_sold = models.PositiveIntegerField(default=0)
    rating = models.PositiveIntegerField(default=0)


class ProductsImage(models.Model):
    products = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='project_img')
    image = models.FileField(upload_to='products')
    is_cover = models.BooleanField(default=False)


class Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_id')
    quantity = models.IntegerField()
    size = models.CharField(max_length=30)


class WishList(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wish_product')


# class deals