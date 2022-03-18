from django.shortcuts import render
from .models import *
from .serializers import CartSerializer
from rest_framework.parsers import JSONParser
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework.decorators import api_view


def cat():
    category = []
    x = Category.objects.all()
    for item in x:
        category.append(item)
    return category


def index(request):
    category = Category.objects.all()

    return render(request, 'home.html', {'cat': cat()})


def shop(request, category=None):
    return render(request, 'shop.html', {'cat': cat()})


@csrf_exempt
def api_cart(request):
    # print('#'*100, request.data)
    if request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = CartSerializer(data=data)
        if serializer.is_valid():
            # serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)



@csrf_exempt
@api_view(['GET', 'post'])
def cart(request):
    return render(request, 'cart.html')


def details(request, product_id):
    product = Product.objects.get(pk=product_id)
    data = {}
    for item in product.information.split('\n'):
        x = item.replace(' = ', '=')
        data[x.split('=')[0]] = x.split('=')[1]
    return render(request, 'details.html', {'product': product, 'info': data})

