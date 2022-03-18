from django.db import models
# noinspection PyUnresolvedReferences
from MainSite.models import CustomUser

# Create your models here.


class Category(models.Model):
    name = models.CharField(max_length=20)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True)
    image1 = models.ImageField(upload_to='site', null=True, blank=True,
                               help_text='this field is only for the first parent(very important).')
    image2 = models.ImageField(upload_to='site', blank=True, null=True,
                               help_text='this field is only for the first parent.')
    image3 = models.ImageField(upload_to='site', blank=True, null=True,
                               help_text='this field is only for the first parent.')

    def __str__(self):
        if self.parent is None:
            return self.name
        else:
            return str(self.parent)+'--'+self.name


class Product(models.Model):
    # Cartigory_cap = "Caps"
    # Cartigory_Men = "Men"
    # Cartigory_Wemen = "Wemen"

    name = models.CharField(max_length=50)
    # cartigory = models.CharField(max_length=50, choices=(
    #     (Cartigory_cap, Cartigory_cap),
    #     (Cartigory_Men, Cartigory_Men),
    #     (Cartigory_Wemen, Cartigory_Wemen),
    # ))
    old_price = models.CharField(max_length=10)
    new_price = models.CharField(max_length=10)
    stock_amount = models.CharField(max_length=20)
    amount_left = models.CharField(max_length=20)
    description = models.TextField(max_length=1000)
    information = models.TextField()


class ProductsImage(models.Model):
    products = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.FileField(upload_to='products')
    is_cover = models.BooleanField(default=False)


class Cart(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    product = models.OneToOneField(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    size = models.IntegerField()
    price = models.CharField(max_length=20)
