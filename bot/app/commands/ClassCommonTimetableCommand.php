<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/functions/core.php";

class ClassCommonTimetableCommand
{
    private Bot $bot;

    public function __construct(Bot $bot)
    {
        $this->bot = $bot;
    }

    /**
     * @throws Exception
     */
    public function execute(array $message, int $messageId = null): void
    {
        $chatId = $message['chat']['id'];

        $user = DB::selectOne("SELECT class_list FROM users WHERE chat_id = ? LIMIT 1", [$chatId]);

        if (empty($user)) {
            $this->bot->sendMessage($chatId, "❌ Ошибка пользователя");
            return;
        }

        $classList = $user["class_list"] ?? null;

        $row = [];
        $classes = [];

        if (is_string($classList)) {
            $decoded = json_decode($classList, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $classes = $decoded;
            } else {
                $classes = [$classList];
            }
        } elseif (is_array($classList)) {
            $classes = $classList;
        }

        if (count($classes) == 0) {
            (new OptParallelCommand($this->bot))->execute($message, "Для начала выберите свой класс");
            return;
        }

        $list = [];
        foreach ($classes as $class) {
            $list[] = Keyboard::button($class, $this->bot->cmd("common-week-timetable", $class));
        }
        $row[] = $list;
        $row[] = [Keyboard::button("Закрыть", "close")];
        $keyboard = ['inline_keyboard' => $row];

        $text = "📌 Выберите класс из списка ниже, чтобы посмотреть его постоянное расписание";
        if ($messageId) {
            $this->bot->editMessage($chatId, $messageId, $text, $keyboard);
        } else {
            $this->bot->sendMessage($chatId, $text, $keyboard);
        }
    }
}
