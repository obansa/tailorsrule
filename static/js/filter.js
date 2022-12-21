var all_data;
var all_filtered_data;
var display_data=[]
var group={}
var active_filter = false

var max_page = 1;
var current_page = 1;
var per_page = 8;
var data_count = 0;

var html_colors = ['Pink', 'LightPink', 'HotPink', 'DeepPink', 'PaleVioletRed', 'MediumVioletRed', 'Lavender', 'Thistle', 'Plum', 'Orchid', 'Violet', 'Fuchsia', 'Magenta', 'MediumOrchid', 'DarkOrchid', 'DarkViolet', 'BlueViolet', 'DarkMagenta', 'Purple', 'MediumPurple', 'MediumSlateBlue', 'SlateBlue', 'DarkSlateBlue', 'RebeccaPurple', 'Indigo ', 'LightSalmon', 'Salmon', 'DarkSalmon', 'LightCoral', 'IndianRed ', 'Crimson', 'Red', 'FireBrick', 'DarkRed', 'Orange', 'DarkOrange', 'Coral', 'Tomato', 'OrangeRed', 'Gold', 'Yellow', 'LightYellow', 'LemonChiffon', 'LightGoldenRodYellow', 'PapayaWhip', 'Moccasin', 'PeachPuff', 'PaleGoldenRod', 'Khaki', 'DarkKhaki', 'GreenYellow', 'Chartreuse', 'LawnGreen', 'Lime', 'LimeGreen', 'PaleGreen', 'LightGreen', 'MediumSpringGreen', 'SpringGreen', 'MediumSeaGreen', 'SeaGreen', 'ForestGreen', 'Green', 'DarkGreen', 'YellowGreen', 'OliveDrab', 'DarkOliveGreen', 'MediumAquaMarine', 'DarkSeaGreen', 'LightSeaGreen', 'DarkCyan', 'Teal', 'Aqua', 'Cyan', 'LightCyan', 'PaleTurquoise', 'Aquamarine', 'Turquoise', 'MediumTurquoise', 'DarkTurquoise', 'CadetBlue', 'SteelBlue', 'LightSteelBlue', 'LightBlue', 'PowderBlue', 'LightSkyBlue', 'SkyBlue', 'CornflowerBlue', 'DeepSkyBlue', 'DodgerBlue', 'RoyalBlue', 'Blue', 'MediumBlue', 'DarkBlue', 'Navy', 'MidnightBlue', 'Cornsilk', 'BlanchedAlmond', 'Bisque', 'NavajoWhite', 'Wheat', 'BurlyWood', 'Tan', 'RosyBrown', 'SandyBrown', 'GoldenRod', 'DarkGoldenRod', 'Peru', 'Chocolate', 'Olive', 'SaddleBrown', 'Sienna', 'Brown', 'Maroon', 'White', 'Snow', 'HoneyDew', 'MintCream', 'Azure', 'AliceBlue', 'GhostWhite', 'WhiteSmoke', 'SeaShell', 'Beige', 'OldLace', 'FloralWhite', 'Ivory', 'AntiqueWhite', 'Linen', 'LavenderBlush', 'MistyRose', 'Gainsboro', 'LightGray', 'Silver', 'DarkGray', 'DimGray', 'Gray', 'LightSlateGray', 'SlateGray', 'DarkSlateGray', 'Black']
var to_filter = [];

var filter_success = null

//get data from database
function filter_data(filter){
    $.post('/store/api_filter', filter, function (data) {
            console.log(data);
            filter_success = true;
            all_data = data
            max_page = Math.ceil(data_count/per_page)
            group_data()
            filtration()

    });
}

//filter_data('{"name":"Caftan"}')

// pagination
function pagination(action){
    var li = ''

    if(active_filter){
    if(all_data.length > 0){data_count=all_filtered_data.length}else{data_count=0}
    }else{data_count=all_data.length};
    max_page = Math.ceil(data_count/per_page)
    for (x=1; x<=max_page; x++){
        if (x == current_page){
            li += '<li class="is-active"><a>'+x+'</a></li>'
        }else{li += '<li><a>'+x+'</a></li>'}
    }
    $('.shop-p__pagination').html(li)
}

function current_pg(){
    var current_range = [per_page*current_page-per_page, per_page*current_page]
    display_data=[]

    //page to display
    for (c=current_range[0]; c<current_range[1]; c++){
        if (active_filter){
            if(all_filtered_data[c] != undefined){
                display_data.push(all_filtered_data[c])
            }
        }else{
            if(all_data[c] != undefined){
                display_data.push(c)
            }
        }
    }

    // html display elements
    $('#everything').children().each(function(){
        var is_existing = false
        for (x=0; x < display_data.length; x++){
            if (all_data.length > 0){
            if($(this).attr('id') == 'id-'+all_data[display_data[x]].id){is_existing=true}}
        }
        //console.log(is_existing)
        if(is_existing == false){
            $(this).remove();
        };
    });
    for (x=0; x < display_data.length; x++){
        if (all_data.length > 0){
            if($('#id-'+all_data[display_data[x]].id).html() == undefined){
                var html = '<div class="col-lg-4 col-md-6 col-sm-6" id="id-'+all_data[display_data[x]].id+'">'+
                                '<div class="product-m">'+
                                    '<div class="product-m__thumb">'+
                                        '<a class="aspect aspect--bg-grey aspect--square u-d-block" href="/store/details/'+all_data[display_data[x]].id+'">'+
                                            '<img class="aspect__img" src="'+all_data[display_data[x]].image[0]+'" alt=""></a>'+
                                        '<div class="product-m__quick-look">'+
                                            '<a class="fas fa-search" id="ql-'+all_data[display_data[x]].id+'" data-modal="modal" data-modal-id="#quick-look" data-tooltip="tooltip" data-placement="top" title="Quick Look"></a></div>'+
                                        '<div class="product-m__add-cart">'+
                                            '<a class="btn--e-brand" id="ac-'+all_data[display_data[x]].id+'" data-modal="modal" data-modal-id="#add-to-cart">Add to Cart</a></div>'+
                                    '</div>'+
                                    '<div class="product-m__content">'+
                                        '<div class="product-m__category">'+
                                            '<a href="shop-side-version-2.html">Men Clothing</a></div>'+
                                        '<div class="product-m__name">'+
                                            '<a href="product-detail.html">'+all_data[display_data[x]].name+'</a></div>'+
                                        '<div class="product-m__rating gl-rating-style"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i><i class="far fa-star"></i><i class="far fa-star"></i>'+
                                            '<span class="product-m__review">(23)</span></div>'+
                                        '<div class="product-m__price">$'+all_data[display_data[x]].price+'</div>'+
                                        '<div class="product-m__hover">'+
                                            '<div class="product-m__preview-description">'+
                                                '<span>'+all_data[display_data[x]].description+'</span></div>'+
                                            '<div class="product-m__wishlist">'+
                                                '<a class="far fa-heart" id="'+all_data[display_data[x]].id+'" data-tooltip="tooltip" data-placement="top" title="Add to Wishlist"></a></div>'+
                                       '</div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'
                $('#everything').append(html)
            }
        }
    }
}

//filler checked input from all data
function filtration(){
    if (to_filter.length > 0){
        active_filter=true; all_filtered_data=[];
        var arrays = []
        for(var item in to_filter){
            if (group[to_filter[item]] !== undefined){
            arrays.push(group[to_filter[item]]);
            }
        };
        if (arrays.length > 0){
            all_filtered_data = arrays.reduce((a, b) => a.filter(c => b.includes(c)));
        }else{all_filtered_data = []};
    }else{active_filter=false}
    if (active_filter){alert(all_filtered_data.length)}else(alert(all_data.length))
    pagination()
    current_pg()
}

//rearrange data buy types
function group_data(){
    group = {}
    for (x=0; x < all_data.length; x++){
        var colors = all_data[x].color.replace(/, /g,',').replace(/ /g,'').split(',')
//        console.log(colors)
        for (y=0; y < colors.length; y++){
            if (group[colors[y]] !== undefined){
                group[colors[y]].push(x)
            }else{
                group[colors[y]]=[x]


            }
        }

    }
    $('#s-color ul').html('')
//    alert('MySite'.replace(/([A-Z])/g, '$1').trim())
    for (x=0; x < html_colors.length; x++){
        var col = html_colors[x].toLowerCase()
        if(group[col] !== undefined){
            var add_color = '<li><div class="color__check">'+
                                    '<input type="checkbox" id="'+col+'" class="color">'+
                                    '<label class="color__check-label" for="'+col+'" style="background-color: '+col+'"></label><span style="margin-left: 30px">'+html_colors[x]+'Black'.replace(/\B([A-Z])\B/g, ' $1')+'</span></div>'+
                                    '<span class="shop-w__total-text">('+group[col].length+')</span></li>'
                $('#s-color ul').append(add_color)
        }
    }
    console.log(group)

//    $('#s-color input').each(function(){
//        group[$(this).attr('id')]=[]
//    })
}


function on_load(name){
    var set = name.replace(/&#x27;/g, '').replace(/ /g,'').replace(/\'/,'')
    var set_b = set.split('--')
    setTimeout(function(){
        $('.f'+set).parents('ul').css('display','block')
        $('.f'+set).parents('li').each(function(){
            var ids = $(this).attr('id')
            if(ids != 'f'+set){
                $('#'+ids+' .js-shop-category-span:first').addClass('is-expanded')
            }
        })
        $('.f'+set).addClass('fas fa-spinner fa-spin')
    }, 1000)
    filter_data('{"category": "'+name.replace(/&#x27;/g, "'")+'"}')
    var interval = setInterval(() => {
        if(filter_success){
            $('.f'+set).removeClass('fas fa-spinner fa-spin').addClass('fas fa-check')
            clearInterval(interval)
        }
    },1000)

}

$(document).ready(function(){
    $('#first-filter li a').click(function(){
        var parent = $(this).parent().attr('id')
        if ($('.'+parent).hasClass('fas fa-spinner fa-spin')){return;
        }else if($('.'+parent).hasClass('fas fa-check')){return;}else{
//            $('#first-filter i').removeClass('fas fa-spinner fa-spin fa-check')
            $('.'+parent).addClass('fas fa-spinner fa-spin')
            filter_data('{"category": "'+$(this).attr('class')+'"}')
            var interval = setInterval(() => {
                if(filter_success){
                    $('#first-filter i').removeClass('fas fa-spinner fa-spin fa-check')
                    $('.'+parent).removeClass('fas fa-spinner fa-spin').addClass('fas fa-check')
                    to_filter=[]
                    clearInterval(interval)
                }
            },1000)

        }

    });

    $(document).on("click", 'input', function(){
        var item = $(this).attr('class')
        if ($(this).is(':checked')){
            to_filter.push($(this).attr('id'))
        }else{
            to_filter.splice(to_filter.indexOf($(this).attr('id')),1)
        }
        console.log(to_filter)
        filtration()
    });

    $(document).on("click", ".pd-detail__form.cart button", function(){
        var checking = $(this).attr('id').split('-')
        var quant = $('.pd-detail__form .input-counter input').val()
        $('#add-to-cart').modal({
                    backdrop: 'static',
                    keyboard: false,
                    show:true
                });
        for( x in all_data){
            if (all_data[x].id == parseInt(checking[1])){
                add_to_cart(all_data[x].id, all_data[x].name, quant, parseInt(quant)*all_data[x].price, all_data[x].size, all_data[x].image[0])
            }
        }

    });

    $(document).on("click",".shop-p__pagination a", function(){
        current_page = parseInt($(this).html())
        current_pg()
        $('.shop-p__pagination li').removeClass('is-active')
        $(this).closest('li').addClass('is-active')
    });

    $(document).on("click", '[data-modal="modal"]', function(){
        $('#cartName').html('');$('#cartQant').html(''); $('#cartP').html('');
        $('.success__text-wrap').css('display', 'none'); $('.s-option__link-box').css('display', 'none');
        $('.s-option__text').html('loading'); $('#add-to-cart .dismiss-button').removeClass('fas fa-times')
        $('.success__img-wrap').css('display', 'none')
        var getElemId = $(this).data('modal-id');
        $(getElemId).modal({backdrop: 'static', keyboard: false, show:true});
        var checking = $(this).attr('id').split('-')
        for( x in all_data){
            if (all_data[x].id == parseInt(checking[1])){
                if (checking[0]=='ql'){
                    quick_look(all_data[x])
                }else{
                    add_to_cart(all_data[x].id, all_data[x].name, '1', all_data[x].new_price, all_data[x].size, all_data[x].image[0])
                }
            }
        }
    });

});