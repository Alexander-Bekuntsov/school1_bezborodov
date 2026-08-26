<?php

class SettingsCommand
{
    private Bot $bot;

    public function __construct(Bot $bot)
    {
        $this->bot = $bot;
    }

    public function execute(array $message, $messageId = null): void
    {
        $chatId = $message['chat']['id'];
        $user = DB::selectOne("
            SELECT u.*, t.name AS teacher_name
            FROM users u
            LEFT JOIN users__teachers t ON t.chat_id = u.chat_id
            WHERE u.chat_id = ?
            LIMIT 1
        ", [$chatId]);

        $formatMap = [
            "TEXT" => "🅰️ Текст",
            "IMAGE" => "🏞️ Фото"
        ];

        $mailingMap = [
            1 => "🔔 Да",
            0 => "🔕 Нет"
        ];

        $fontMap = [
            1 => "☑️ Засечки",
            0 => "#️⃣ Без засечек"
        ];

        $onlyTeacherScheduleMap = [
            1 => "💬 Получать всё",
            0 => "👑 Только своё"
        ];

        $data = [
            [Keyboard::button("Формат расписания: " . $formatMap[$user["format"]], $this->bot->cmd("settings", "format", "toggle"))],
            [Keyboard::button("Рассылка расписания: " . $mailingMap[$user["mailing"]], $this->bot->cmd("settings", "mailing", "toggle"))],
        ];

        if ($user["format"] == "IMAGE") {
            $data[] = [Keyboard::button("Шрифт на фото: " . $fontMap[$user["font"] != null], $this->bot->cmd("settings", "font", "toggle"))];
        }

        if ($user["teacher_name"] != null) {
            $data[] = [Keyboard::button("Тип расписания: " . $onlyTeacherScheduleMap[$user["hide_classes"] == 0], $this->bot->cmd("settings", "teacher-only", "toggle"))];
        }

        $data[] = [Keyboard::button("Закрыть", "close")];
        $keyboard = Keyboard::inline($data);

        $text = "⚙️ Выберите нужную категорию ниже";
        if ($messageId) {
            $this->bot->editMessage($chatId, $messageId, $text, $keyboard);
        } else {
            $this->bot->sendMessage($chatId, $text, $keyboard);
        }
    }
}
