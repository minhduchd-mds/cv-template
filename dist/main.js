const main = {};
(function ($) {
    "use strict";
    main.targets = function () {
        let i = 0;
        const text =
            "Tạo ra những sản phẩm chất lượng mang lại giá trị cho khách hàng cũng như sự phát triển của công ty.";
        titime();
        function titime() {
            if (i < text.length) {
                $("#text-tagert").append(text.charAt(i));
                i++;
                setTimeout(titime, 80);
            }
        }
    };
    main.skill = function () {
        $('.skill-percent').each(function(){
            $(this).animate({
                width:$(this).attr('data-percent')},"fast");
        });
    };

    main.pgaeSlider = function () {
        const  setting = $(".v-bottom-navigation i");
        setting.click(function (e) {
            const icon = $(this).text();
            if(icon === '1'){
                $(".profile, #main-right").addClass("active").siblings().removeClass("active");
                $("#card-right-1 ,#card-left-1,#card-right-2 ,#card-left-2").removeClass("active");
            }else if(icon === '2'){
                $(".profile , #main-right,#card-right-2 ,#card-left-2").removeClass("active");
                $("#card-left-1, #card-right-1").addClass("active").siblings().removeClass("active");
            }else if(icon === '3'){
                $("#card-right-1 ,#card-left-1,.profile, #main-right").removeClass("active");
                $("#card-right-2 ,#card-left-2").addClass("active").siblings().removeClass("active");
            }else if(icon === 'phone'){
                $('.call').toggle();
            }else if(icon === 'download'){
                $('.download-pdf-click').click();
            }
        })
    };

    $(document).ready(function () {
        // eslint-disable-next-line no-undef
        new WOW().init();
        main.skill();
        main.targets();
        main.pgaeSlider();
    });
// eslint-disable-next-line no-undef
})(jQuery);
