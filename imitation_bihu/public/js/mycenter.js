$(".container .top .tabtitle p").click(function () {
    // alert($(this).index())
    $(this).addClass('cur').siblings().removeClass('cur');
    $(".container .tab>div").eq($(this).index()).show()
    .siblings('div').hide();
})
