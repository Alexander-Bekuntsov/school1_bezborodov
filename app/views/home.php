<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/functions/core.php";

$user = Auth::requireAuth();

$uri = $_SERVER['REQUEST_URI'] === "/dashboard/app/" ? "/full" : $_SERVER['REQUEST_URI'];
$uri = str_replace("dashboard/", "", $uri);

$pageFile = __DIR__ . "/../pages/" . basename($uri) . ".php";
$pageFile = file_exists($pageFile) ? $pageFile : __DIR__ . "/404.php";
$homePages = HOME_PAGES;

//if (!getLessonsByDate(getNextDayDate(), "11А") != []) {
//    $homePages = array_filter($homePages, fn($item) => $item['link'] !== '/reset');
//    $homePages = array_values($homePages);
//}
?>
<div class="app">
    <div class="container">
        <div class="app__left">
            <div style="text-align: center">
                <div class="app__logo">
                    1 SCHOOL
                </div>
                <span style="font-size: 12px;opacity: 0.5;font-weight: 400;">Bezborodov Alexander</span>
            </div>

            <div class="nav">
                <!--                <div class="nav__float"></div>-->
                <?php foreach ($homePages as $item): ?>
                    <div class="nav__item js-nav-item" data-link="/dashboard/app<?= esc($item["link"]) ?>">
                        <?= esc($item["title"]) ?>
                    </div>
                <?php endforeach; ?>
                <div data-href="/" class="nav__item">Перейти на сайт</div>
                <div class="nav__item js-account-logout">Выйти из системы</div>
            </div>
        </div>

        <div class="app__content-wrapper">
            <div class="app__title" style="height: 38px">
                <h1 class="js-page-title"></h1>
            </div>
            <div class="app__content">
                <?php require_once $pageFile; ?>
            </div>
        </div>
    </div>
</div>

<script>
    $(function () {
        const $items = $('.js-nav-item');
        function updateMenuAndTitle() {
            const currentPath = window.location.pathname;
            $items.removeClass('item--active');
            let $active = $items.filter(`[data-link="${currentPath}"]`);
            if (!$active.length) $active = $items.first();
            $active.addClass('item--active');
            $('.js-page-title').text($active.text());
        }

        updateMenuAndTitle();

        $items.on('click', function () {
            const link = $(this).data('link');
            if (link.includes("reset")) {
                if (!confirm("Обычное и учительское расписания будут сброшены. Продолжить?")) {
                    $items.removeClass('item--active');
                    return;
                }
            }
            if (link) window.location.href = link;
        });
    });
</script>