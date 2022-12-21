from .models import Category, Product


def category(name):
    lists = []
    for x in Category.objects.all():
        if name in str(x):
            lists.append(x.id)
    return tuple(lists)


def trending():
    product, sort_p, cate = [], [], []

    for x in Category.objects.filter(parent=None):
        # print(category(x.name))
        products = Product.objects.filter(category__in=category(x.name)).order_by('-amount_sold')[:12]
        if len(products) != 0:
            cate.append(x.name)
        product.append(products)
        # print(Product.objects.filter(category__in=category(x.name)).order_by('-amount_sold')[:12])
    for x in range(12):
        for a in range(len(product)):
            try:
                sort_p.append(product[a][x])
            except IndexError:
                pass
    return sort_p[:12], cate


def quick_looks(*args):
    quick_look = []
    for x in args:
        for item in x:
            add = True
            for y in quick_look:
                if item.id == y.get('id'):
                    add = False
            if add:
                x = {"id": item.id, "name": item.name, "discount": item.discount, "price": item.price,
                     "color": item.color, "size": item.size, "description": item.description,
                     "stock_amount": item.stock_amount, "amount_left": item.amount_left, "category": str(item.category)}

                img = []
                for what in item.project_img.all():
                    if what.is_cover:
                        img.insert(0, what.image.url)
                    else:
                        img.append(what.image.url)
                x['image'] = img
                quick_look.append(x)
    return quick_look
