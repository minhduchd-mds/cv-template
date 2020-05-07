var main = {};
(function ($) {
    "use strict";

    main.goToTop = function () {
        const $goToTop = $("#back-to-top");

        $goToTop.on("click", function () {
            $("body,html").animate({ scrollTop: 0 }, 1000);
            return false;
        });

        window.onscroll = function () {
            scrollFunction();
        };

        function scrollFunction() {
            if (
                document.body.scrollTop > 100 ||
                document.documentElement.scrollTop > 100
            ) {
                $("#menu").addClass("sticky");
            } else {
                $("#menu").removeClass("sticky");
            }
            if (
                document.body.scrollTop > 500 ||
                document.documentElement.scrollTop > 500
            ) {
                $("#back-to-top").show();
            } else {
                $("#back-to-top").hide();
            }
        }
    };
    main.counters = function () {
        $(".timer").countTo();
    };
    main.cument = function () {
        $(".customer-logos").slick({
            dots: false,
            infinite: false,
            autoplay: true,
            autoplaySpeed: 1500,
            speed: 300,
            slidesToShow: 4,
            slidesToScroll: 4,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        dots: false,
                    },
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                    },
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    },
                },
            ],
        });
    };
    main.search = function () {
        $("#trigger-overlay").click(function () {
            $("#myOverlay").show();
            $(".closebtn").click(function () {
                $("#myOverlay").hide();
            });
        });
    };

    main.navhover = function () {
        $(".dropdown").hover(
            function () {
                $(".dropdown-menu", this).stop(true, true).slideDown("fast");
                $(this).toggleClass("open");
            },
            function () {
                $(".dropdown-menu", this).stop(true, true).slideUp("fast");
                $(this).toggleClass("open");
            }
        );

        $(".dropdown.fade").hover(function () {
            $(this).fadeOut(100);
            $(this).fadeIn(500);
        });
    };
    main.action = function () {
        $("#project-news ul.project-news-id .active" + "::before").css(
            "opacity",
            "0"
        );

        $(".filter-button").click(function () {
            const active = $(this).attr("data-set");
            $(this).addClass("active").siblings().removeClass("active");
            if (active) {
                $("#project-news ul.project-news-id .active" + active + "::before").css(
                    "opacity",
                    "1"
                );
            }
        });
    };
    main.responsive = function () {
        $(window).resize(function () {
            const width = $(window).width();
            console.log(width);
            if (width <= 768) {
                // eslint-disable-next-line no-empty
            } else {
            }
        });
    };
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
        let width = 0;
        const id = setInterval(frame, 30);
        function frame() {
            setTimeout(function () {
                if (width >= 90) {
                    clearInterval(id);
                } else {
                    width++;
                    $(".html")
                        .html(width + "%")
                        .css("width", width + "%");
                    $(".css")
                        .html(width + "%")
                        .css("width", width + "%");
                    $(".js")
                        .html(width + "%")
                        .css("width", width + "%");
                    $(".boostrap")
                        .html(width + "%")
                        .css("width", width + "%");
                    $(".photoshop")
                        .html(width + "%")
                        .css("width", width + "%");
                }
            }, 100);
        }
    };
    main.pgaeSlider = function () {
        $(".carousel-control-prev-1").on("click", function () {
            $(".profile, #main-right")
                .addClass("active")
                .siblings()
                .removeClass("active");
            $("#card-right-1 ,#card-left-1").removeClass("active");
        });

        $(".carousel-control-next-1").on("click", function () {
            $(".profile , #main-right").removeClass("active");
            $("#card-left-1, #card-right-1")
                .addClass("active")
                .siblings()
                .removeClass("active");
            $("#setting-slider")
                .find(".carousel-control-next-2,.carousel-control-prev-2")
                .addClass("active");
            $("#setting-slider")
                .find(".carousel-control-next-1,.carousel-control-prev-1")
                .removeClass("active");

            $(".carousel-control-prev-2").on("click", function () {
                $(".profile , #main-right")
                    .addClass("active")
                    .siblings()
                    .removeClass("active");
                $("#card-right-1 ,#card-left-1").removeClass("active");
                $("#setting-slider")
                    .find(".carousel-control-next-1,.carousel-control-prev-1")
                    .addClass("active");
                $("#setting-slider")
                    .find(".carousel-control-next-2,.carousel-control-prev-2")
                    .removeClass("active");
            });

            $(".carousel-control-next-2").on("click", function () {
                $("#card-right-1 ,#card-left-1").removeClass("active");
                $("#card-right-2 ,#card-left-2")
                    .addClass("active")
                    .siblings()
                    .removeClass("active");

                $("#setting-slider")
                    .find(".carousel-control-next-3,.carousel-control-prev-3")
                    .addClass("active");
                $("#setting-slider")
                    .find(".carousel-control-next-2,.carousel-control-prev-2")
                    .removeClass("active");

                $(".carousel-control-prev-3").on("click", function () {
                    $("#card-right-1 ,#card-left-1")
                        .addClass("active")
                        .siblings()
                        .removeClass("active");
                    $("#card-right-2 ,#card-left-2").removeClass("active");

                    $("#setting-slider")
                        .find(".carousel-control-next-2,.carousel-control-prev-2")
                        .addClass("active");
                    $("#setting-slider")
                        .find(".carousel-control-next-3,.carousel-control-prev-3")
                        .removeClass("active");
                });

                $(".carousel-control-next-3").on("click", function () {
                    $("#card-right-2 ,#card-left-2").removeClass("active");
                    $("#card-right-3 ,#card-left-3")
                        .addClass("active")
                        .siblings()
                        .removeClass("active");

                    $(".profile, #main-right")
                        .addClass("active")
                        .siblings()
                        .removeClass("active");

                    $("#setting-slider")
                        .find(".carousel-control-next-1,.carousel-control-prev-1")
                        .addClass("active");
                    $("#setting-slider")
                        .find(".carousel-control-next-3,.carousel-control-prev-3")
                        .removeClass("active");
                });
            });
        });
    };
    $(document).ready(function () {
        // eslint-disable-next-line no-undef
        new WOW().init();
        main.counters();
        main.goToTop();
        main.cument();
        main.search();
        main.navhover();
        main.action();
        main.skill();
        main.targets();
        main.pgaeSlider();
    });
    (function (factory) {
        // eslint-disable-next-line no-undef
        if (typeof define === "function" && define.amd) {
            // AMD
            // eslint-disable-next-line no-undef
            define(["jquery"], factory);
        } else if (typeof exports === "object") {
            // CommonJS
            factory(require("jquery"));
        } else {
            // Browser globals
            // eslint-disable-next-line no-undef
            factory(jQuery);
        }
    })(function ($) {
        const CountTo = function (element, options) {
            this.$element = $(element);
            this.options = $.extend(
                {},
                CountTo.DEFAULTS,
                this.dataOptions(),
                options
            );
            this.init();
        };

        CountTo.DEFAULTS = {
            from: 0, // the number the element should start at
            to: 0, // the number the element should end at
            speed: 1000, // how long it should take to count between the target numbers
            refreshInterval: 100, // how often the element should be updated
            decimals: 0, // the number of decimal places to show
            formatter: formatter, // handler for formatting the value before rendering
            onUpdate: null, // callback method for every time the element is updated
            onComplete: null, // callback method for when the element finishes updating
        };

        CountTo.prototype.init = function () {
            this.value = this.options.from;
            this.loops = Math.ceil(this.options.speed / this.options.refreshInterval);
            this.loopCount = 0;
            this.increment = (this.options.to - this.options.from) / this.loops;
        };

        CountTo.prototype.dataOptions = function () {
            const options = {
                from: this.$element.data("from"),
                to: this.$element.data("to"),
                speed: this.$element.data("speed"),
                refreshInterval: this.$element.data("refresh-interval"),
                decimals: this.$element.data("decimals"),
            };

            var keys = Object.keys(options);

            for (const i in keys) {
                const key = keys[i];

                if (typeof options[key] === "undefined") {
                    delete options[key];
                }
            }

            return options;
        };

        CountTo.prototype.update = function () {
            this.value += this.increment;
            this.loopCount++;

            this.render();

            if (typeof this.options.onUpdate == "function") {
                this.options.onUpdate.call(this.$element, this.value);
            }

            if (this.loopCount >= this.loops) {
                clearInterval(this.interval);
                this.value = this.options.to;

                if (typeof this.options.onComplete == "function") {
                    this.options.onComplete.call(this.$element, this.value);
                }
            }
        };

        CountTo.prototype.render = function () {
            var formattedValue = this.options.formatter.call(
                this.$element,
                this.value,
                this.options
            );
            this.$element.text(formattedValue);
        };

        CountTo.prototype.restart = function () {
            this.stop();
            this.init();
            this.start();
        };

        CountTo.prototype.start = function () {
            this.stop();
            this.render();
            this.interval = setInterval(
                this.update.bind(this),
                this.options.refreshInterval
            );
        };

        CountTo.prototype.stop = function () {
            if (this.interval) {
                clearInterval(this.interval);
            }
        };

        CountTo.prototype.toggle = function () {
            if (this.interval) {
                this.stop();
            } else {
                this.start();
            }
        };

        function formatter(value, options) {
            return value.toFixed(options.decimals);
        }

        $.fn.countTo = function (option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data("countTo");
                var init = !data || typeof option === "object";
                var options = typeof option === "object" ? option : {};
                var method = typeof option === "string" ? option : "start";

                if (init) {
                    if (data) data.stop();
                    $this.data("countTo", (data = new CountTo(this, options)));
                }

                data[method].call(data);
            });
        };
    });
// eslint-disable-next-line no-undef
})(jQuery);
