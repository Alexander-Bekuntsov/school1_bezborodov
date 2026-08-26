<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/functions/core.php";

$user = Auth::requireAuth();

$teachers = getLastListOfTeachers();

// Получаем chat_id всех учителей сразу
$placeholders = implode(',', array_fill(0, count($teachers), '?'));
$chatIdsRaw = DB::select("
    SELECT LOWER(name) as name_lower, chat_id, UPPER(access_key) as access_key, key_activation_date, key_usage_count
    FROM users__teachers 
    WHERE LOWER(name) IN ($placeholders)
", array_map('mb_strtolower', $teachers));

$chatIds = [];
foreach ($chatIdsRaw as $row) {
    $chatIds[$row['name_lower']] = [$row['chat_id'], $row['access_key'], $row['key_activation_date'], $row['key_usage_count']];
}
?>
<style>
    .teachers-list {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        list-style: none;
        padding: 0;
        font-family: Arial, sans-serif;
    }

    .teachers-list__item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
        transition: 0.3s;
        outline: 2px solid transparent;
        outline-offset: -3px;
    }

    .teachers-list__item.item--danger {
        outline-color: rgba(255, 0, 0, 0.4);
    }

    .teachers-list__item.item--success {
        outline-color: rgba(24, 255, 0, 0.11) !important;
    }

    .teachers-list__item.item--select {
        outline-color: rgba(128, 128, 128, 0.18);
    }

    .teachers-list__item:hover {
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .teachers-list__name {
        font-weight: bold;
        transition: 0.2s;
        user-select: none;
    }

    .name--min {
        font-size: 13px;
    }

    .teachers-list__input {
        width: 150px;
        padding: 5px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        text-align: right;
    }

    .info {
        margin-bottom: 10px;
    }
</style>

<div class="info">
    <span class="fav fav--info"></span>
    Учительские аккаунты для рассылки расписания по <code>chat_id</code> (Telegram). Чтобы узнать <code>ID</code>
    другого
    человека в <code>Telegram Dekstop</code>, откройте Telegram
    на компьютере и войдите в свой аккаунт. Нажмите на три горизонтальные полоски в левом верхнем углу и выберите
    «Настройки», затем прокрутите вниз и включите «Экспериментальные функции».
    <br><br>
    После этого откройте профиль нужного человека, кликнув на его имя или аватар. В профиле под именем или в разделе с
    информацией о пользователе появится <code>ID</code>: - это уникальный идентификатор этого пользователя.
</div>

<div class="teachers-list">
    <?php foreach ($teachers as $teacher):
        $formattedName = mb_strtoupper(mb_substr($teacher, 0, 1)) . mb_strtolower(mb_substr($teacher, 1));
        $chatId = $chatIds[mb_strtolower($teacher)][0] ?? '';
        $accessKey = $chatIds[mb_strtolower($teacher)][1] ?? '<span style="font-family: \'JetBrains Mono\',serif;font-weight: 700">ДОБАВЬТЕ-АККАУНТ-ДЛЯ-КЛЮЧА</span>';
        $lastActivationKey = $chatIds[mb_strtolower($teacher)][2] ?? '<span style="font-family: \'JetBrains Mono\',serif;font-weight: 700">НЕ-АКТИВИРОВАН</span>';
        $countActivationKey = $chatIds[mb_strtolower($teacher)][3] ?? '-';

        $class = '';
        if ($chatId === '') {
            $class = 'item--select';
        } elseif (strpos($chatId, '-') !== false) {
            $class = 'item--danger';
        }
        ?>
        <div class="teachers-list__item <?= $class ?>" data-teacher="<?= htmlspecialchars($teacher) ?>"
            style="align-items: center;gap: 15px;">
            <div style="display:flex;flex-direction:column;gap: 5px;">
                <span class="teachers-list__name"><?= htmlspecialchars($formattedName) ?></span>
                <div style="display:flex;flex-direction:column;">
                    <span style="font-size: 8px;font-family: 'JetBrains Mono',serif;"
                        class="teachers-list__key"><?= $accessKey ?></span>
                    <span style="font-size: 8px;font-family: 'JetBrains Mono',serif;" class="teachers-list__key">Активация:
                        <?= $lastActivationKey ?> (<?= $countActivationKey ?>)</span>
                </div>
            </div>
            <input class="teachers-list__input" style="width: 125px" type="text" value="<?= htmlspecialchars($chatId) ?>"
                placeholder="Chat ID">
        </div>
    <?php endforeach; ?>
</div>

<script>
    $(document).ready(function () {
        const debounceTimers = {};

        $('.teachers-list__input').on('input', function () {
            const $input = $(this);
            const $item = $input.closest('.teachers-list__item');
            const teacherName = $item.data('teacher');
            const chatId = $input.val();

            $item.removeClass('item--danger item--select');

            if (chatId === '') {
                $item.addClass('item--select');
            } else if (chatId.includes('-')) {
                $item.addClass('item--danger');
            }

            if (debounceTimers[teacherName]) {
                clearTimeout(debounceTimers[teacherName]);
            }

            debounceTimers[teacherName] = setTimeout(function () {
                const $nameEl = $item.find('.teachers-list__name');
                slideText($nameEl, 'Загрузка...');

                $.ajax({
                    url: './api/teachers/update_chat_id.php',
                    method: 'POST',
                    data: {
                        teacher: teacherName,
                        chat_id: chatId
                    },
                    success: function (response) {
                        $item.addClass('item--success');
                        slideText($nameEl, $nameEl.data('original') || teacherName);
                        setTimeout(() => {
                            $nameEl.removeClass("name--min");
                        }, 200)
                        setTimeout(() => {
                            $item.removeClass('item--success');
                        }, 3000)
                    },
                    error: function (err) {
                        $item.addClass('item--danger');
                        $nameEl.addClass("name--min");
                        slideText($nameEl, err.responseJSON.error);
                    }
                });
            }, 800);
        });

        $('.teachers-list__name').each(function () {
            $(this).data('original', $(this).text());
        });
    });
</script>