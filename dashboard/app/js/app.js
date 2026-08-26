setTimeout(() => {
    $("body").addClass("body--loaded");
}, 420);

$(document).on(
    "click",
    "button:not(.bzb-window-refresh):not(.bzb-window-reset):not(.bzb-window-close), [data-href]",
    function (e) {
        var $self = $(this);
        if ($self.is(".btn-disabled")) {
            return;
        }
        if ($self.closest("[data-ripple]")) {
            e.stopPropagation();
        }
        var initPos = $self.css("position"),
            offs = $self.offset(),
            x = e.pageX - offs.left,
            y = e.pageY - offs.top,
            dia = Math.min(this.offsetHeight, this.offsetWidth, 100), // start diameter
            $ripple = $("<div/>", {class: "ripple", appendTo: $self});

        if (!initPos || initPos === "static") {
            $self.css({position: "relative"});
        }
        $("<div/>", {
            class: "rippleWave",
            css: {
                background: $self.data("ripple"),
                width: dia,
                height: dia,
                left: x - dia / 2,
                top: y - dia / 2,
            },
            appendTo: $ripple,
            one: {
                animationend: function () {
                    $ripple.remove();
                },
            },
        });
    }
);

$(function () {
    function initTimer($el) {
        if ($el.data('timer-initialized')) return; // чтобы не инициализировать дважды
        $el.data('timer-initialized', true);

        const endTs = parseInt($el.data('end-date')) * 1000;
        const $hours = $el.find('.flipdown-hours');
        const $minutes = $el.find('.flipdown-minutes');
        const $seconds = $el.find('.flipdown-seconds');

        let interval; // объявляем заранее

        function update() {
            const now = Date.now();
            let diff = Math.floor((endTs - now) / 1000);

            if (diff <= 0) {
                $hours.text('00');
                $minutes.text('00');
                if ($seconds.length) $seconds.text('00');
                clearInterval(interval);
                return;
            }

            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;

            $hours.text(String(h).padStart(2, '0'));
            $minutes.text(String(m).padStart(2, '0'));
            if ($seconds.length) $seconds.text(String(s).padStart(2, '0'));
        }

        const intervalTime = $seconds.length ? 1000 : 30 * 1000;
        update(); // сразу обновляем таймер
        interval = setInterval(update, intervalTime); // теперь interval уже объявлен
    }

    // Инициализация существующих таймеров
    $('.flipdown[data-end-date]').each(function () {
        initTimer($(this));
    });

    // Следим за динамически добавляемыми элементами
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            $(mutation.addedNodes).each(function () {
                const $node = $(this);
                if ($node.is('.flipdown[data-end-date]')) {
                    initTimer($node);
                }
                $node.find('.flipdown[data-end-date]').each(function () {
                    initTimer($(this));
                });
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});

    $(document).on("click", "[data-href]", function () {
    setTimeout(() => {
        document.location.href = $(this).data("href");
    }, 250);
});

$(document).on("focus", "[data-mask]", function () {
    if ($(this).data("init") !== undefined) return;

    $(this).mask($(this).data("mask"));
    $(this).data("init", true);

    if ($(this).val() == 0) {
        if ($(this).attr("data-placebefore") == undefined) {
            $(this).attr("data-placebefore", $(this).attr("placeholder"));
        }
        $(this).attr("placeholder", "+7 (___) ___ __-__");
    }
});

$(document).on("click", "[data-mask]", function () {
    $(this).focus().get(0).setSelectionRange(0, 0);
});

$(function () {
    if ($("body:has([data-focus]")) {
        var input = $("[data-focus]");
        input.focus();
        try {
            const length = input.val().length;
            input[0].setSelectionRange(length, length);
        } catch (error) {
        }
    } else {
        return;
    }
});

$(document).on("paste", ".form input", function () {
    const $current = $(this);
    setTimeout(function () {
        const $form = $current.closest(".form");
        const $inputs = $form.find("input:visible:enabled");
        const currentIndex = $inputs.index($current);

        if (currentIndex !== -1 && currentIndex + 1 < $inputs.length) {
            $inputs.eq(currentIndex + 1).focus();
        }
    }, 0);
});

$(function () {
    const $nav = $('.nav');
    const $float = $nav.find('.nav__float');
    const $items = $nav.find('.nav__item');

    /**
     * Перемещает и масштабирует nav__float под указанный элемент
     * @param {jQuery} $target - элемент навигации, под который нужно переместить подсветку
     */
    function moveFloat($target) {
        if (!$target.length) return;

        const {top, left} = $target.position();
        const width = $target.outerWidth();
        const height = $target.outerHeight();

        $float.css({
            top: top,
            width: `${width}px`,
            height: `${height}px`
        });
    }

    /**
     * Устанавливает активный пункт меню
     * @param {jQuery} $item - пункт меню, который нужно сделать активным
     */
    function setActiveItem($item) {
        $items.removeClass('item--active');
        $item.addClass('item--active');
        // moveFloat($item);
    }

    // События
    $items.on('click', function () {
        setActiveItem($(this));
    });

    // Инициализация позиции
    moveFloat($items.filter('.item--active'));

    // Обновление позиции при ресайзе окна
    $(window).on('resize', function () {
        moveFloat($items.filter('.item--active'));
    });
});

$(document).on("click", ".js-account-logout", function () {
    $(this).addClass("disabled");
    $.ajax({
        url: './api/auth/auth_logout.php',
        dataType: 'json',
        success: function (response) {
            if (response.status === 'ok') {
                location.reload();
            } else {
                alert(response);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('AJAX error:', textStatus, errorThrown);
        }
    });
});

// Проверка и установка куки
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toUTCString();
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
}

const slideText = ($el, newHtml) => {
    gsap.to($el, {
        y: "-100%",
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: function () {
            $el.html(newHtml);
            gsap.set($el, {y: "100%", opacity: 0});
            gsap.to($el, {
                y: "0%",
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    });
}
