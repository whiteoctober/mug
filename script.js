$(function () {
    $.fn.rotate = function(angle) {
        return this.css({
            "-webkit-transform": "rotate("+angle+"deg)",
            "-moz-transform": "rotate("+angle+"deg)",
            "-o-transform": "rotate("+angle+"deg)",
            "-ms-transform": "rotate("+angle+"deg)",
            "transform": "rotate("+angle+"deg)"
        });
    };

    var alerter = window.alert;
    var alert = function(text) { alerter("Out of coffee! Trying to refill: Status code 418 "+text); };

    var mugCode = function(){
        var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
        $(this).on('mugorientation', function(e) {
            var coffee, drink;

            drink = __bind(function(coffee, angle) {
                return Math.min($(this).height() * angle, coffee.height());
            }, this);

            coffee = $('.coffee', this);
            if (!coffee.size()) {
                return;
            }
            coffee.height(drink(coffee, e.angle));

            if (coffee.height() <= 0) {
                coffee.remove();
                return $(this).trigger('more.coffee');
            }
        });
        $(this).on('more.coffee', function() {
            return $.get('coffee://trojan', {

                success: __bind(function(coffee) {
                    return $(this).append(coffee);
                }, this),

                statusCode: {
                    418: function() {
                        return alert("I'm a tea pot");
                    }
                }
            });
        });
    }

    var mug = $('#mug');
    mug.each(mugCode);

    var oriented = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i);
    if (!oriented) $("header h1").text("Spin to drink coffee");

    var mugAngle = 0;
    var curr = {x: 0, y: 0, angle: 0};
    var direction = 0;
    var buffer = 4;
    var drawRotatedMug = function(mugEvent) {
        if (oriented) mug.rotate(-(1 - mugEvent.angle) * 90);
        mug.children(".front, .back").rotate((1 - mugEvent.angle) * 90);

        if (mugEvent.angle > 0.5 && mugEvent.angle < 1.5) {
            var dir = mugEvent.angle > 1 ? 1 : -1;
            mug.children(".coffee").css("left", dir * (1 - mugEvent.angle) * 60);
            mug.find(".coffee img").css("width", 370 + Math.abs(1 - mugEvent.angle) * 300);
        }

        mugEvent.angle = mugEvent.angle > 1 ? 1 - (mugEvent.angle - 1) : mugEvent.angle;
        mug.children(".background").css("top", 680 - mug.children(".coffee").height());
    }

    var hasRotated = function(a, b) {
        return a.angle > b.angle && a.angle - b.angle < Math.PI/2 && a.angle - b.angle > Math.PI/32;
    }

    $(".button.about").click(function() {
        $(".popup").toggle();
        return false;
    });
    $(document).on('click', function() { $(".popup").hide(); });

    $(document).on('mousemove', function(e) {
        var next = {x: e.clientX, y: e.clientY};
        next.angle = Math.atan2(curr.x - next.x, curr.y - next.y);

        if (hasRotated(curr, next)) {
            if (direction < 0) direction = 0;
            if (direction++ > buffer) mugAngle++;
        }
        if (hasRotated(next, curr)) {
            if (direction > 0) direction = 0;
            if (direction-- < -buffer) mugAngle--;
        }
        curr = next;

        var mugEvent = jQuery.Event("mugorientation");
        mugEvent.angle = 1 - mugAngle / 30;
        drawRotatedMug(mugEvent);
        mug.trigger(mugEvent);
    });

    if (oriented) {
        var betafirst;
        // Mugs are slightly different from browsers
        window.addEventListener("deviceorientation", function(e) {
            if (!betafirst) betafirst = e.beta;
            // Mugs have a slightly different api
            var mugEvent = jQuery.Event("mugorientation");
            mugEvent.angle = 1 - (Math.abs(betafirst - e.beta) / 90);
            if (e.gamma < 0) mugEvent.angle = 2 - mugEvent.angle;

            drawRotatedMug(mugEvent);
            mug.trigger(mugEvent);
        });

        var orientStart = window.orientation
        var reorient = function(e) {
            $("#content .wrapper").rotate(orientStart - window.orientation);
            var mugEvent = jQuery.Event("mugorientation");
            mugEvent.angle = 0;
            mug.trigger(mugEvent);
        }
        window.onorientationchange = reorient;
    }
});
