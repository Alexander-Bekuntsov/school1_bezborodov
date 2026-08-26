<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/functions/core.php";

$user = Auth::requireAuth();

$isLoadedDefault = getLessonsByDateFromCommonTtimeTable("Пн", "11А") ?>
<div id="schedule" class="schedule" data-common="true">
    <?php if ($isLoadedDefault): ?>
        <div style="color: green;font-weight: 600;margin-bottom: 15px;font-size: 16px">
            Файл был загружен
        </div>
    <?php endif; ?>
    <input type="file" name="file" id="schedule_filepond" />
    <div id="schedule_response">
        <div class="info">
            <b>Постоянное расписание</b> – это примерное расписание на всю неделю для учебного года. Оно формируется по
            тому же шаблону, что и обычное расписание, но смотрит <b>все дни</b> недели, а не только завтрашний день
        </div>
        <br>
        <div class="info">
            <span class="fav fav--info"></span>
            <a style="color: black" href="/dashboard/app/files/pattern.xlsx"><code>ПРИМЕР</code> Шаблон для
                загрузки
                расписания</a>
        </div>
    </div>
</div>