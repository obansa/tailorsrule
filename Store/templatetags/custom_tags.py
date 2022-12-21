from django import template
register = template.Library()


@register.filter
def cate_parent(string, action=None):
    if action == 'id':
        return str(string).split('--')[0].replace(' ', '').replace("'",'')
    elif action == 'split':
        return str(string).split('--')
    else:
        return str(string).split('--')[0]


@register.filter
def subtotal(cart):
    price = 0
    for x in cart:
        price += (int(x.product.price)*int(x.quantity))
    return price


@register.filter
def count(cart):
    return len(cart)


@register.filter
def deal(name, counts=None):
    if name == 'class':
        if counts == 3:
            return 'col-lg-5 col-md-5 u-s-m-b-30'
        else:
            return 'col-lg-7 col-md-7 u-s-m-b-30'
    elif name == 'class2':
        print(counts)
        if counts == 3:
            return 'aspect aspect--bg-grey aspect--square'
        else:
            return 'aspect aspect--bg-grey aspect--1286-890'
    elif name == 'about':
        return 'coming soon'


