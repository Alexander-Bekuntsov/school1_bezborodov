if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.js-policy-confirm');
    const confirmBlock = document.querySelector('.confirm');

    if (!btn || !confirmBlock) return;

    btn.addEventListener('click', async () => {
        setCookie('policy_confirmed', '1', 3650);
        confirmBlock.classList.remove('confirm--show');
        try {
            await fetch('/webapp/api/confirm.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ confirmed: true })
            });
        } catch (e) {
            console.warn('Confirm API error:', e);
        }
    });
});

const swiperClasses = new Swiper('.swiper-classes', {
    slidesPerView: "auto",
    slidesPerGroup: 8,
    spaceBetween: 12,
    mousewheel: {
        enabled: true,
        forceToAxis: true,
        sensitivity: 1,
        releaseOnEdges: true,
        thresholdDelta: 10,
        thresholdTime: 300,
    },
    freeMode: {
        enabled: true,
        momentum: true,
        momentumRatio: 1,
        momentumVelocityRatio: 1,
        sticky: false,
    },
    speed: 500,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

Fancybox.bind("[data-fancybox]", {
    closeButton: "top",
    dragToClose: true,
    click: "close",
});

// PullToRefresh.init({
//     mainElement: 'body',
//     onRefresh() {
//         location.reload();
//     }
// });

const loader = document.querySelector('.loader');

// Функции для работы с cookie
function getCookie(name) {
    const match = document.cookie.match(
        new RegExp('(^| )' + name + '=([^;]+)')
    );
    return match ? decodeURIComponent(match[2]) : '';
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5);
    document.cookie =
        `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

if (loader) {
    const lastLoaderTime = parseInt(getCookie("llt_time") || "0", 10);
    const now = Math.floor(Date.now() / 1000);

    if (now - lastLoaderTime >= 2400) {
        loader.classList.remove('loader--skip');

        setCookie("llt_time", now, 1);

        setTimeout(() => {
            loader.classList.add('loader--skip');
        }, 1900);
    } else {
        if (!loader.classList.contains('loader--skip')) {
            setTimeout(() => {
                loader.classList.add('loader--skip');
            }, 2000);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // Мобильые устройства
        document.body.addEventListener('click', async (e) => {
            const item = e.target.closest('.js-timetable-share');
            if (!item) return;
            const url = item.dataset.url;
            if (!url) return;

            if (navigator.share) {
                try {
                    await navigator.share({ url });
                } catch (err) {
                    console.error("Ошибка шаринга:", err);
                }
            } else {
                await navigator.clipboard.writeText(url);
                alert("Ссылка скопирована в буфер");
            }
        });
    } else {
        // ПК
        tippy.delegate(document.body, {
            target: '.js-timetable-share',
            content: 'Поделиться',
            theme: 'light',
            placement: 'top',
            trigger: 'mouseenter',
            hideOnClick: false,
        });

        // Клик по элементу - копирование
        document.body.addEventListener('click', async (e) => {
            const item = e.target.closest('.js-timetable-share');
            if (!item) return;
            const url = item.dataset.url;
            if (!url) return;

            try {
                await navigator.clipboard.writeText(url);
                // Показываем кастомный тултип
                const tip = tippy(item, {
                    content: 'Ссылка скопирована',
                    trigger: 'manual',
                });
                tip.show();
                setTimeout(() => tip.destroy(), 1500);
            } catch (err) {
                console.error("Ошибка копирования:", err);
                const tip = tippy(item, {
                    content: 'Не удалось скопировать!',
                    trigger: 'manual',
                });
                tip.show();
                setTimeout(() => tip.destroy(), 1500);
            }
        });
    }

    // tippy.delegate(document.body, {
    //     target: '.js-timetable-default',
    //     content: window.innerWidth > 768
    //         ? 'Смотреть полное расписание'
    //         : 'Постоянное расписание',
    //     theme: 'light',
    //     placement: 'top',
    //     trigger: 'mouseenter',
    //     onShow(instance) {
    //         if (window.innerWidth > 768) {
    //             return;
    //         }
    //         if (localStorage.getItem('timetableTooltipShown')) {
    //             return false;
    //         }
    //         localStorage.setItem('timetableTooltipShown', '1');
    //         setTimeout(() => {
    //             instance.hide();
    //         }, 3000);
    //     }
    // });
});

document.addEventListener("DOMContentLoaded", () => {
    tippy.delegate(document.body, {
        target: '.js-link-shared',
        content: 'С вами поделились этим классом и чтобы сохранить выберите класс его ниже',
        theme: 'light',
        placement: 'top',
        trigger: 'mouseenter focus',
        hideOnClick: false,
        maxWidth: 300
    });

    const headerTitle = document.querySelector('.header__title');
    if (!headerTitle) return;

    headerTitle.addEventListener('click', () => {
        location.reload();
    });
});

(function () {

    "use strict";

    /* =========================
       CONFIG
    ========================== */

    const COOKIE_NAME = 'classes';
    const MAX_LENGTH = 4;
    const COOKIE_DAYS = 3650;
    const REQUEST_URL = '/webapp/components/timetable.php';
    const ANIMATION_ENABLED = true;
    const LOADER_DELAY = 2500;
    const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

    const timetableEl = document.querySelector('#timetable');
    const loaderEl = document.querySelector('.loader');
    const headerTitleEl = document.querySelector('#headerTitle');

    let loaderTimer = null;
    let currentRequest = null;

    // FIX: контроль актуального запроса
    let requestId = 0;
    let activeRequestId = 0;

    let refreshTimer = null;
    let lastActiveTime = Date.now();

    function getInitialSlide(swiperElement) {
        const attr = swiperElement.dataset.initialDay;
        const slideIndex = parseInt(attr, 10);
        return Number.isFinite(slideIndex) ? slideIndex : 2;
    }

    function isInitiallyOpened(el) {
        return el.dataset.opened === 'true';
    }

    function initDefaultSwiper(swiperElement) {
        if (swiperElement.swiper) return swiperElement.swiper;

        const swiper = new Swiper(swiperElement, {
            slidesPerView: 1,
            speed: 500,
            centeredSlides: false,
            autoHeight: true,
            slideToClickedSlide: true,
            initialSlide: getInitialSlide(swiperElement),

            navigation: {
                nextEl: swiperElement.querySelector('.swiper-button-next'),
                prevEl: swiperElement.querySelector('.swiper-button-prev'),
            },

            breakpoints: {
                769: {
                    slidesPerView: 'auto',
                    centeredSlides: true,
                    initialSlide: getInitialSlide(swiperElement),
                }
            }
        });

        if (isInitiallyOpened(swiperElement)) {
            const item = swiperElement.closest('.timetable__item');

            if (item) {
                item.classList.add('item--default-open');
            }

            swiperElement.style.height = 'auto';

            requestAnimationFrame(() => {
                swiper.update();
            });
        }

        return swiper;
    }

    function autoInitSwipers() {
        const swipers = document.querySelectorAll(
            '.timetable__default.swiper-default[data-opened="true"]'
        );

        swipers.forEach((el) => {
            const item = el.closest('.timetable__item');
            if (!item) return;

            initDefaultSwiper(el);
            item.classList.add('item--default-open');
            el.style.height = 'auto';

            requestAnimationFrame(() => {
                el.swiper.update();
            });
        });
    }

    function animateElementHeight(element, shouldOpen) {
        const startHeight = element.offsetHeight;

        element.style.height = 'auto';
        const targetHeight = shouldOpen ? element.offsetHeight : 0;

        element.style.height = startHeight + 'px';
        element.offsetHeight; // force reflow

        requestAnimationFrame(() => {
            element.style.transition = 'height 400ms cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.height = targetHeight + 'px';
        });

        element.addEventListener('transitionend', function onEnd(e) {
            if (e.propertyName !== 'height') return;

            element.style.transition = '';
            if (shouldOpen) element.style.height = 'auto';
            element.removeEventListener('transitionend', onEnd);
        });
    }

    function closeOtherItems(currentItem) {
        const allItems = document.querySelectorAll('.timetable__item:has([data-opened="false"])');
        allItems.forEach((item) => {
            if (item === currentItem) return;
            if (!item.classList.contains('item--default-open')) return;

            const content = item.querySelector('.timetable__default.swiper-default');
            if (!content) return;

            item.classList.remove('item--default-open');
            animateElementHeight(content, false);
        });
    }

    function toggleTimetableDefault(triggerElement) {
        const item = triggerElement.closest('.timetable__item');
        if (!item) return;

        const content = item.querySelector('.timetable__default.swiper-default');
        if (!content) return;

        const isOpen = item.classList.contains('item--default-open');

        if (!content.swiper) initDefaultSwiper(content);

        const isMobile = window.innerWidth < 769;
        if (!isOpen && isMobile) closeOtherItems(item);

        item.classList.toggle('item--default-open');
        animateElementHeight(content, !isOpen);

        if (!isOpen) {
            requestAnimationFrame(() => {
                content.swiper.update();
            });
        }
    }

    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('.js-timetable-default');
        if (!trigger) return;

        toggleTimetableDefault(trigger);
    });

    autoInitSwipers();

    /* =========================
       COOKIE
    ========================== */

    function getClasses() {
        const val = getCookie(COOKIE_NAME);
        return val ? val.split(',') : [];
    }

    function saveClasses(arr) {
        setCookie(COOKIE_NAME, arr.join(','), COOKIE_DAYS);
    }

    /* =========================
       UI HELPERS
    ========================== */

    function toggleActive(el, active) {
        el.classList.toggle('item--active', active);
    }

    function animateReplace(html) {
        if (!ANIMATION_ENABLED) {
            timetableEl.innerHTML = html;
            return;
        }

        timetableEl.style.transition = 'opacity .18s ease';
        timetableEl.style.opacity = '0';

        requestAnimationFrame(() => {
            setTimeout(() => {
                timetableEl.innerHTML = html;
                timetableEl.style.opacity = '1';
                autoInitSwipers();
            }, 180);
        });
    }

    /* =========================
    AUTO REFRESH
    ========================= */

    async function refreshTimetable() {
        const selected = getClasses();
        if (!selected.length) return;

        console.log("refresh...");
        setHeaderTitle('Обновление...');

        const now = new Date();
        const hours = now.getHours();

        const isDayTime = hours >= 5 && hours < 16;
        const isNightTime = hours >= 23 || hours < 5;
        const hasTomorrowBlock = document.querySelector('.js-timetable-tomorrow') !== null;

        const shouldSkipReload = isDayTime || isNightTime || hasTomorrowBlock;

        if (shouldSkipReload) {
            console.log('Skip reload');
            try {
                await loadTimetable(selected);

                if (navigator.onLine) {
                    setTimeout(() => {
                        setHeaderTitle('Первая');
                    }, 300);
                }
            } catch (e) {
                console.error('Ошибка обновления:', e);
                setHeaderTitle('Первая');
            }
            return;
        }
        console.log('Hard reload');
        document.location.reload();
    }

    function startRefreshTimer() {

        stopRefreshTimer();

        refreshTimer = setInterval(() => {

            // обновляем только если вкладка активна
            if (document.visibilityState === 'visible') {
                refreshTimetable();
            }

        }, AUTO_REFRESH_INTERVAL);
    }

    function stopRefreshTimer() {
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
        }
    }

    // FIX: loader показывается только если запрос всё ещё актуален
    function showLoaderDelayed(id) {

        clearTimeout(loaderTimer);

        loaderTimer = setTimeout(() => {
            if (id === activeRequestId) {
                loaderEl?.classList.remove('loader--skip');
            }
        }, LOADER_DELAY);
    }

    // FIX: всегда очищаем таймер
    function hideLoader() {
        clearTimeout(loaderTimer);
        loaderTimer = null;
        loaderEl?.classList.add('loader--skip');
    }

    /* =========================
       NETWORK
    ========================== */

    async function loadTimetable(selected) {

        if (!navigator.onLine) {
            console.log("offline");
            return;
        }

        // abort previous request
        if (currentRequest) {
            currentRequest.abort();
        }

        const controller = new AbortController();
        currentRequest = controller;

        // FIX: создаём id запроса
        const id = ++requestId;
        activeRequestId = id;

        const url = REQUEST_URL + '?select=' + encodeURIComponent(selected.join(','));

        showLoaderDelayed(id);
        updateNetworkStatus();

        try {

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            // FIX: если запрос уже не актуален — выходим
            if (id !== activeRequestId) return;

            const html = await response.text();

            animateReplace(html);
        } catch (e) {

            if (e.name !== 'AbortError') {
                console.error(e);
            }

        } finally {
            updateNetworkStatus();
            if (id === activeRequestId) {
                hideLoader();
            }
        }
    }

    /* =========================
       SWIPER SCROLL (mobile UX)
    ========================== */

    function scrollSwiperTo(el = null) {
        if (!swiperClasses) return;

        let targetIndex = null;

        if (el) {
            const slide = el.closest('.swiper-slide');
            if (!slide) return;

            targetIndex = Array.from(swiperClasses.slides).indexOf(slide);

        } else {
            const activeItems = Array.from(
                document.querySelectorAll('.classes__item.item--active')
            );

            if (!activeItems.length) return;

            const activeIndexes = activeItems
                .map(item => {
                    const slide = item.closest('.swiper-slide');
                    return slide
                        ? Array.from(swiperClasses.slides).indexOf(slide)
                        : -1;
                })
                .filter(i => i >= 0)
                .sort((a, b) => a - b);

            const currentIndex = swiperClasses.activeIndex;

            let leftIndex = null;

            for (let i = activeIndexes.length - 1; i >= 0; i--) {
                if (activeIndexes[i] <= currentIndex) {
                    leftIndex = activeIndexes[i];
                    break;
                }
            }

            if (leftIndex === null) {
                leftIndex = activeIndexes[0];
            }

            const rightNeighbor = activeIndexes.find(
                i => i === leftIndex + 1
            );

            if (rightNeighbor !== undefined) {
                targetIndex = leftIndex + 0.5;
            } else {
                targetIndex = leftIndex;
            }
        }

        swiperClasses.slideTo(targetIndex - 1, 300);
    }

    scrollSwiperTo();

    /* =========================
       MAIN CLICK HANDLER
    ========================== */

    function handleClick(el) {

        const value = el.dataset.class;
        if (!value || value.length > MAX_LENGTH) return;

        let selected = getClasses();
        const index = selected.indexOf(value);

        if (index !== -1) {
            selected.splice(index, 1);
            toggleActive(el, false);
            // const activeEl = document.querySelector('.classes__item.item--active');
            // if (activeEl && activeEl.dataset.class.length === 2) {
            //     scrollSwiperTo();
            // }
        } else {
            selected.unshift(value);
            toggleActive(el, true);
        }

        const url = new URL(window.location.href);
        url.searchParams.delete('share');
        window.history.replaceState({}, '', url);

        saveClasses(selected);

        loadTimetable(selected);
    }

    function setHeaderTitle(text) {
        if (!headerTitleEl) return;
        if (headerTitleEl.textContent === text) return;

        headerTitleEl.style.transition = 'opacity .2s ease';
        headerTitleEl.style.opacity = '0';

        setTimeout(() => {
            headerTitleEl.textContent = text;
            headerTitleEl.style.opacity = '1';
        }, 200);
    }

    function updateNetworkStatus() {
        if (navigator.onLine) {
            setHeaderTitle('Первая');
            headerTitleEl.classList.remove("header--offline");
        } else {
            setHeaderTitle('Нет интернета');
            headerTitleEl.classList.add("header--offline");
        }
    }

    /* =========================
       EVENTS
    ========================== */
    window.addEventListener('offline', () => {
        console.log("offline");
        updateNetworkStatus();
    });

    window.addEventListener('online', () => {
        console.log("online");
        updateNetworkStatus();
    });

    document.querySelectorAll('.classes__item[data-class]')
        .forEach(el => {
            el.addEventListener('click', () => handleClick(el));
        });

    window.addEventListener('offline', () => {
        console.log("offline");
        updateNetworkStatus();
    });

    window.addEventListener('online', () => {
        console.log("online");
        updateNetworkStatus();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            lastActiveTime = Date.now();
            stopRefreshTimer();
        } else {
            const inactiveTime = Date.now() - lastActiveTime;
            if (inactiveTime > AUTO_REFRESH_INTERVAL) {
                refreshTimetable();
            }
            startRefreshTimer();
        }
    });

    startRefreshTimer();
})();

(function () {
    const ua = navigator.userAgent.toLowerCase();
    const btn = document.getElementById('addHomeBtn');
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isStandalone) {
        btn.style.display = 'none';
        return;
    }

    if (isIos) {
        btn.style.display = 'inline-block';
        btn.addEventListener('click', () => {
            alert('Чтобы добавить сайт на главный экран: нажмите "Поделиться" → "На экран «Домой»"');
        });
    }
    else if (isAndroid) {
        btn.style.display = 'inline-block';
        btn.addEventListener('click', () => {
            alert('Чтобы добавить сайт на главный экран: нажмите "Меню → Добавить на главный экран" в браузере');
        });
    }
    else {
        btn.style.display = 'none';
    }
})();

(function () {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android|mobile/.test(ua);

    if (!isMobile) {
        document.title = "Расписание Первой";
    }

    document.querySelectorAll('.logo-animate').forEach(svg => {
        svg.querySelectorAll('path, circle, rect, polygon, polyline').forEach(el => {
            const length = el.getTotalLength ? el.getTotalLength() : 0;

            if (length > 0) {
                el.style.strokeDasharray = length;
                el.style.strokeDashoffset = length;
            }
        });
    });

    const authLink = document.getElementById("authLink");

    async function logout() {
        await fetch('/webapp/api/auth/logout.php', {
            method: 'POST',
            credentials: 'include'
        });
        location.reload();
    }

    if (authLink) {
        const teacherCookie = getCookie("auth_teacher");
        if (teacherCookie) {
            if (window.innerWidth > 768) {
                tippy(authLink, {
                    content: 'Выйти',
                    placement: 'bottom',
                    onShow(instance) {
                        instance.popper.addEventListener('click', (e) => {
                            logout();
                        });
                    }
                });
            }
            authLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm("Выйти из аккаунта?")) {
                    logout();
                }
            });
        } else {
            authLink.addEventListener('click', async () => {

                const key = prompt("Введите ключ, чтобы войти в аккаунт и просматривать личное расписание");
                if (!key) return;

                try {
                    const response = await fetch('/webapp/api/auth/index.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ access_key: key })
                    });

                    const result = await response.json();

                    if (result.success) {
                        location.reload();
                    } else {
                        alert(result.message);
                    }

                } catch (e) {
                    alert('Ошибка соединения');
                }
            });
        }
    }
})();

// document.addEventListener("DOMContentLoaded", () => {
//     const MAX_RETRIES = 3;
//     let FALLBACK_SRC = "/webapp/img/image_error.svg";
//
//     const images = document.querySelectorAll("img");
//
//     images.forEach((img) => {
//         handleImage(img, MAX_RETRIES);
//     });
//
//     function handleImage(img, retriesLeft) {
//         if (img.dataset.errorReplaced) return;
//
//         const shouldRetry =
//             img.complete && img.naturalWidth === 0;
//
//         if (shouldRetry) {
//             tryReload(img, retriesLeft);
//         } else {
//             img.addEventListener(
//                 "error",
//                 () => tryReload(img, retriesLeft),
//                 { once: true }
//             );
//         }
//     }
//
//     function tryReload(img, retriesLeft) {
//         if (retriesLeft <= 0) {
//             replaceWithFallback(img);
//             return;
//         }
//
//         const currentSrc = img.getAttribute("src");
//         if (!currentSrc) return;
//
//         if (!img.dataset.beforeUrl) {
//             img.dataset.beforeUrl = currentSrc;
//         }
//
//         const newSrc = appendRetryQuery(currentSrc);
//
//         img.addEventListener(
//             "error",
//             () => tryReload(img, retriesLeft - 1),
//             { once: true }
//         );
//
//         img.setAttribute("src", newSrc);
//     }
//
//     function replaceWithFallback(img) {
//         if (img.dataset.errorReplaced) return;
//
//         const currentSrc = img.getAttribute("src");
//
//         if (currentSrc && !img.dataset.beforeUrl) {
//             img.dataset.beforeUrl = currentSrc;
//         }
//
//         img.setAttribute("src", FALLBACK_SRC);
//         img.dataset.errorReplaced = "true";
//     }
//
//     function appendRetryQuery(src) {
//         const separator = src.includes("?") ? "&" : "?";
//         const query =
//             "retry=" + Math.random().toString(36).substring(2, 7);
//         return src + separator + query;
//     }
// });