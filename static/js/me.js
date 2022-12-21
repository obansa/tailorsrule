var wait=false
var sign_phone;
function add_to_cart(id, name, quantity, price, size, image) {
    auth()
    var interval = setInterval(() => {
        if (wait == null){
            $('#add-to-cart').modal('hide')
            wait = false
            clearInterval(interval)
        }else if(!wait){
            $('#cartName').html(name);
            $('#cartQant').html('Quantity: '+quantity);
            $('#cartP').html(price);
            if(image !== undefined){
                $('.success__img-wrap img').prop('src', image)
            }
            $('.success__img-wrap').css('display', '')
            console.log('{"product": '+ id +', "quantity": "'+ quantity +'","size": "'+ size +'","user": "'+ user_x +'" }')
            $.post('/store/cart_api', '{"product": '+ id +', "quantity": "'+ quantity +'","size": "'+ size +'","user": "'+ user_x +'" }', function (data) {
                console.log(data);
                $('.s-option__link-box').css('display', '');
                $('.s-option__text').html('1 item (s) in your cart');
                $('.success__text-wrap').css('display', '')
                $('#add-to-cart .dismiss-button').addClass('fas fa-times')
                mini_cart_all(user_x)

            })
            clearInterval(interval)
        }
    }, 1000);
}

function mini_cart_all(user){
    $.post('/store/m_cart','{"phone": "'+user+'"}',function(data){
        $('.mini-product-container').html('')
        $('.mini-product-stat .subtotal-value').html(0)
        $('.mini-cart-shop-link .total-item-round').html(0)
        for (x in data){
            mini_cart(data[x].id,data[x].category,data[x].name,data[x].quantity,data[x].price,data[x].image)
        }
    });
}


function mini_cart(id, category, name, quantity, price, image){
    var html_tag = '<div class="card-mini-product">'+
                        '<div class="mini-product h'+id+'">'+
                            '<div class="mini-product__image-wrapper">'+
                                '<a class="mini-product__link" href="/shop/details/'+id+'">'+
                                    '<img class="u-img-fluid" style="max-height: 100%;" src="'+image+'" alt=""></a></div>'+
                            '<div class="mini-product__info-wrapper">'+
                                '<span class="mini-product__category">'+
                                    '<a href="shop-side-version-2.html">'+category+'</a></span>'+
                                '<span class="mini-product__name">'+
                                    '<a href="/shop/details/'+id+'">'+name+'</a></span>'+
                                '<span class="mini-product__quantity">'+quantity+' x</span>'+
                                '<span class="mini-product__price">$'+price+'</span></div>'+
                        '</div>'+
                        '<a class="mini-product__delete-link far fa-trash-alt" id="'+id+'"></a>'+
                    '</div>'
    $('.mini-product-container').append(html_tag)
    var total = (quantity*price)+parseInt($('.mini-product-stat .subtotal-value').html().replace('$', ''))
    $('.mini-product-stat .subtotal-value').html('$'+total)
    $('.total-item-round').html(1+parseInt($('.mini-cart-shop-link .total-item-round').html()))
}

function quick_look(data){
    $('.pd-detail__name').html(data.name)
    $('.pd-detail__price').html(data.price)
    $('.pd-detail__del').html(data.discount)
    $('.pd-detail__stock').html(data.stock_amount+' in stock')
    $('.pd-detail__left').html('Only '+data.amount_left+' left')
    $('.pd-detail__preview-desc').html(data.description)
    $('.pd-detail__form button').prop('id', 'ac-'+data.id)
    $('#js-product-detail-modal').html('')
    $('#js-product-detail-modal-thumbnail').html('')
    $('#js-product-detail-modal').prop('class', '')
    $('#js-product-detail-modal-thumbnail').prop('class', '')
    for (y in data.image){
        imgs = '<div><img class="u-img-fluid" src="'+data.image[y]+'" alt=""></div>'
        $('#js-product-detail-modal').append(imgs)
        $('#js-product-detail-modal-thumbnail').append(imgs)
    }
    RESHOP.productDetailInit();
    RESHOP.modalProductDetailInit();
}

function auth(){
    if (user_x == 'AnonymousUser'){
        wait = true
        $('#login-modal').modal({
            backdrop: 'static',
            keyboard: false,
            show: true
        });
    }
}

function wishList(id){
    auth()
    var interval = setInterval(() => {
        if(!wait){
            $.post('/store/wishlist_api', '{"user": '+ user_x +', "product": "'+ id +'" }', function (data) {
                    console.log(data);
            })
            clearInterval(interval)
        }
    }, 1000);
}

function deleteWishList(id){
    $.ajax({
        url: '/store/wishlist_api',
        type: 'delete',
        data: '{"product": '+id+'}',
        success: function(data){
            console.log(data)
            $('[data-spy="'+id+'"]').remove();
            if($('#content').children().length === 0){
                $('.route-box__link.clear').css('display','none')
            }
        }
    })
};
function clearChart(id){
    $.ajax({
        url: '/store/cart_api',
        type: 'delete',
        data: JSON.stringify({data: id}),
        cache: false,
        success: function(data){
            console.log(data)
            for(a=0; a<id.length; a++){
                $('tr.'+id[a]).remove()
            }
            if($('.table-p tbody').children().length === 0){
                $('.clearCart').css('display','none')
            }
        }
    })

};

$(document).ready(function(){
    // ---------detail---------//
    $(".pd-detail__click-wrap a").click(function(){
        wishList($(this).attr('class'))
    });
    // ---------wish list---------//
    $(document).on('click', '.REMOVE',function(){
        $(this).html('<i class="fas fa-spinner fa-spin"></i> REMOVE')
        deleteWishList($(this).attr('id'))
    });
    $('.route-box__link.clear').click(function(){
        $('.route-box__link.clear i').removeClass('fa-trash').addClass('fa-spinner fa-spin')
        $('#content .info').each(function(){
            deleteWishList($(this).data('spy'))
        });
    });
    // ---------cart---------//
    var update = {};
    $('.table-p__price.cart_price').each(function(){
        var id = $(this).attr('id')
        $(this).html('$'+$('input.'+id).val()*$('input.'+id).attr('id'))
    });
    $('.cartClass .input-counter span').click(function(){
        var id = $(this).attr('id').substring(1)
        $('span#'+id).html('$'+$('input.'+id).val()*$('input.'+id).attr('id'))
        update[id.split('-')[1]]=$('input.'+id).val()
    });
    $('.update').click(function(){
        if (Object.keys(update).length !== 0){
            $('.fa-sync').addClass('fa-spin')
            var data = []
            for (xs in update){
                data.push({"id": xs, "quantity": update[xs]})
            }
            $.ajax({
                url: '/store/cart_api',
                type: 'put',
                data: JSON.stringify({data: data}),
                cache: false,
                success: function(data){
                    console.log(data)
                    $('.fa-sync').removeClass('fa-spin')
                    update={}
                }
            });
        }
    });
    $('.table-p__delete-link').click(function(){
        clearChart([$(this).attr('id')])
    });
    $('.clearCart').click(function(){
        $('.clearCart .fa-trash').removeClass('fa-trash').addClass('fa-spinner fa-spin')
        var ids = []
        $('.table-p tr').each(function(){
            ids.push($(this).attr('class').split(' cartClass')[0])
        });
        clearChart(ids)
    });


    $(document).on('click', '#login-modal .sign-in', function(){
        if($(this).html()=='Sign In'){
            if ($('#login-modal .new-l__form .col1 input').val().length <= 1){
                $('#login-modal .new-l__p1').html('Please enter a valid phone number.')
            }else{
                sign_phone = $('#login-modal .new-l__form .col1 input').val()
                $.post('/store/api_sign_in','{"phone": "'+sign_phone+'"}', function(data){
                    if (data.status == 'logged in'){
                        wait = false; user_x=sign_phone; mini_cart_all(sign_phone)
                        $('#login-modal').modal('hide');
                    }else if(data.status == 'not existing'){
                        sign_up(sign_phone)
                    }else if(data.status == 'require password'){
                        password()
                    }
                });

            }
        }else if($(this).html()=='No'){
            $('#login-modal .new-l__h3').html('sign in')
            $('#login-modal .new-l__p1').html('Please enter the correct phone number.')
            $('#login-modal .new-l__form .col1').html('<input class="news-l__input" type="text" placeholder="Phone Number">')
            $('#login-modal .new-l__form .col2 button').html('Sign In').removeClass('mc btn--e-transparent-secondary-b-2')
        }else if($(this).html()=='Yes'){
            $.ajax({url: '/store/api_sign_in', type: 'put', data: '{"phone": "'+sign_phone+'"}', success: function(data){
                if (data.status == 'logged in'){
                    wait = false; user_x=sign_phone; mini_cart_all(sign_phone)
                    $('#login-modal').modal('hide');

                }
            }});
        }else if($(this).html()=='Confirm'){
            var pass = $('#login-modal .news-l__input').val()
            $.post('/store/api_sign_in','{"phone": "'+sign_phone+'", "password": "'+pass+'"}', function(data){
                if (data.status == 'logged in'){
                    wait = false; user_x=sign_phone; mini_cart_all(sign_phone)
                    $('#login-modal').modal('hide');
                }else{$('#login-modal .new-l__p1').html('the password is incorrect')}
            });
        }
    });
    $('#login-modal .new-l__dismiss').click(function(){
        wait = null;
    });

    //----------------------- mini-product__cart --------------------------//
    $(document).on('click','.mini-product__delete-link',function(){
        var elem = $(this)
        $.ajax({
            url: '/store/cart_api',
            type: 'delete',
            data: JSON.stringify({data: [elem.attr('id')]}),
            cache: false,
            success: function(data){
                var price = $('.h'+elem.attr('id')+' .mini-product__price').html().replace('$','')
                var quantity = $('.h'+elem.attr('id')+' .mini-product__quantity').html()
                elem.closest('.card-mini-product').remove()
                $('.total-item-round').html(parseInt($('.mini-cart-shop-link .total-item-round').html())-1)
                $('.subtotal-value').html('$'+(parseInt($('.subtotal-value').html().replace('$',''))-(parseInt(price)*parseInt(quantity))))
            }
        });
    });

});

function sign_up(phone){
    $('#login-modal .new-l__h3').html('sign up?')
    $('#login-modal .new-l__p1').html('an account with phone number <strong>'+phone+'</strong> do not exist. do you want to sign up a new account?')
    $('#login-modal .new-l__form .col1').html('<button class="btn btn--e-brand-b-2 sign-in" type="submit">Yes</button>')
    $('#login-modal .new-l__form .col2 button').html('No').addClass('mc btn--e-transparent-secondary-b-2')
}

function password(){
    $('#login-modal .new-l__h3').html('Enter password')
    $('#login-modal .new-l__p1').html('password is required')
    $('#login-modal .news-l__input').val('')
    $('#login-modal .news-l__input').attr('type', 'password')
    $('#login-modal .news-l__input').attr('placeholder', 'Password')
    $('#login-modal .new-l__form .col2 button').html('Confirm')
}

function quick(){
    var quick_look_data;
    $.ajax({
        url: '/store/quick_look',
        type: 'get',
        success: function(data){
            console.log(data)
            quick_look_data = data
        }
    });
    $('[data-modal-id="#quick-look"]').click(function(){
        for(item in quick_look_data){
            if(quick_look_data[item].id == $(this).attr('class')){
                quick_look(quick_look_data[item])
            };
        };
    });
    //-------------------add to cart-------------------//
    $('[data-modal-id="#add-to-cart"]').click(function(){
        for(item in quick_look_data){
            if(quick_look_data[item].id == $(this).attr('class')){
                var x = quick_look_data[item]
                add_to_cart(x.id, x.name, '1', x.price, x.size, x.image[0])
            };
        };
    });

    $('.product-o__action-list #Wishlist').click(function(){
        wishList($(this).attr('class'))
    });

    // ---------quick look to cart---------//
    $(document).on("click", ".pd-detail__form.cart button", function(){
        var checking = $(this).attr('id').split('-')
        var quant = $('.pd-detail__form .input-counter input').val()
        $('#add-to-cart').modal({
                    backdrop: 'static',
                    keyboard: false,
                    show:true
                });
        for( x in quick_look_data){
            if (quick_look_data[x].id == parseInt(checking[1])){
                add_to_cart(quick_look_data[x].id, quick_look_data[x].name, quant, parseInt(quant)*quick_look_data[x].price, quick_look_data[x].size)
            }
        }

    });
}
