from django.shortcuts import render
from .models import *
from .serializers import *
from rest_framework.parsers import JSONParser
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .editing import trending, quick_looks, category
# noinspection PyUnresolvedReferences
from MainSite.models import CustomUser
from django.contrib.auth import authenticate, login

quick_look = []


def cat(request):
    cate, carts = [], []
    x = Category.objects.all()
    for item in x:
        cate.append(item)
    if request.user.is_authenticated:
        y = Cart.objects.filter(user=request.user)
    else:
        y = []
    for item in y:
        carts.append(item)
    return cate, carts


def index(request):
    global quick_look
    top_trending = trending()[:12]
    new = Product.objects.order_by('-id')[:6]
    quick_look = quick_looks(top_trending[0], new)
    cart_a = cat(request)
    view = Category.objects.filter(parent=None).order_by('?')[:3]

    return render(request, 'home.html', {'cat': cart_a[0], 'carts': cart_a[1], 'trending': top_trending, 'new': new,
                                         'categories': view})


@csrf_exempt
@api_view(['GET', 'post'])
def api_quick_look(request):
    if request.method == 'GET':
        return Response(quick_look)


def shop(request, categories=None):
    cart_a = cat(request)
    collect = 'All'
    if categories is not None:
        collect = Category.objects.get(id=categories)
    return render(request, 'shop.html', {'cat': cart_a[0], 'carts': cart_a[1],'collect': collect})


@csrf_exempt
def api_cart(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = CartSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            pd = Product.objects.get(id=serializer.data['product'])
            pc = str(pd.category).split('--')[0]
            return JsonResponse({"category": pc}, status=201)
        return JsonResponse(serializer.errors, status=400)

    if request.method == 'PUT':
        data = JSONParser().parse(request)
        for item in data['data']:
            carts = Cart.objects.get(id=item['id'])
            serializer = CartSerializer(carts, data=item, partial=True)
            print(serializer.is_valid())
            if serializer.is_valid():
                serializer.save()
            else:
                return JsonResponse(serializer.errors, status=400)
        return JsonResponse({"status": "ok"}, status=201)
    if request.method == 'DELETE':
        data = JSONParser().parse(request)
        for item in data['data']:
            Cart.objects.get(id=item).delete()
        return JsonResponse({"status": "ok"}, status=200)


@csrf_exempt
@api_view(['POST'])
def m_cart(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        cart_b = Cart.objects.filter(user=CustomUser.objects.get(**data))
        data = []
        for item in cart_b:
            cartegoory = str(item.product.category).split('--')[0]
            x = {"name": item.product.name, "category": cartegoory, "price": item.product.price,
                 "quantity": item.quantity, "id": item.id}
            for y in item.product.project_img.all():
                if y.is_cover:
                    x['image'] = y.image.url
            data.append(x)
        return Response(data)



@csrf_exempt
def api_wish_list(request):
    # print('#'*100, request.data)
    if request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = WishListSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)
    if request.method == 'DELETE':
        data = JSONParser().parse(request)
        WishList.objects.get(**data).delete()
        return JsonResponse({"done": "ok"}, status=200)


@csrf_exempt
@api_view(['GET', 'post'])
def api_filter(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        print(data)
        if data['category'] == 'All':
            products = Product.objects.all().order_by('?')[:100]
        else:
            products = Product.objects.filter(category__in=category(data['category']))
        data = []
        for item in products:
            x = {"id": item.id, "name": item.name, "discount": item.discount, "price": item.price,
                 "color": item.color, "size": item.size, "description": item.description,
                 "stock_amount": item.stock_amount, "amount_left": item.amount_left}
            img = []
            for what in item.project_img.all():
                if what.is_cover:
                    img.insert(0, what.image.url)
                else:
                    img.append(what.image.url)
            x['image'] = img
            data.append(x)
            # data.append(json.dumps(x))
        return Response(data)


def cart(request):
    carts = Cart.objects.filter(user=request.user)
    return render(request, 'cart.html', {'cart': carts})


def details(request, product_id):
    product = Product.objects.get(pk=product_id)
    data = {}
    for item in product.information.split('\n'):
        x = item.replace(' = ', '=')
        data[x.split('=')[0]] = x.split('=')[1]
    return render(request, 'details.html', {'product': product, 'info': data})


def wish_list(request):
    wish = WishList.objects.filter(user=request.user)
    return render(request, 'wishList.html', {'wish': wish})


@csrf_exempt
def api_sign_in(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        user = CustomUser.objects.filter(phone=data.get('phone'))
        if user.count() == 0:
            return JsonResponse({'status': 'not existing'})
        elif data.get('password') is None:
            data['password'] = '1234'
            user = authenticate(**data)
            if user is not None:
                login(request, user)
                return JsonResponse({"status": "logged in"})
            else:
                return JsonResponse({"status": "require password"})
        else:
            user = authenticate(**data)
            if user is not None:
                login(request, user)
                return JsonResponse({"status": "logged in"})
            else:
                return JsonResponse({"status": "password incorrect"})
    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        data['password'] = '1234'
        CustomUser.objects.create_user(**data)
        user = authenticate(**data)
        if user is not None:
            login(request, user)
            return JsonResponse({"status": "logged in"})
