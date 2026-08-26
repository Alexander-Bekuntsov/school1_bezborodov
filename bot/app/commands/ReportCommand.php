<?php

class ReportCommand
{
    private Bot $bot;

    public function __construct(Bot $bot)
    {
        $this->bot = $bot;
    }

    public function execute(array $message, string $text): void
    {
        $chatId = $message['chat']['id'];

        if (mb_strlen($text) < 3) {
            $this->bot->sendMessage($chatId, "<b>Для отправки сообщения</b> используйте команду в формате <code>/mail ТЕКСТ</code>");
            return;
        }
        if (mb_strlen($text) > 100) {
            $this->bot->sendMessage($chatId, "😵‍💫 <b>Слишком длинное</b> сообщение");
            return;
        }

        $user = DB::selectOne("
            SELECT access, class_list, class_active, class_start, CONCAT('@', username) AS username_mention, graduate_year, activity_count, registration_date 
            FROM users 
            WHERE chat_id = ?
        ", [$chatId]);

        if ($user) {
            $userInfo = "";
            foreach ($user as $key => $value) {
                $userInfo .= "<code>" . htmlspecialchars($key) . "</code>: " . htmlspecialchars($value) . "\n";
            }
        } else {
            $userInfo = "Пользователь не найден";
        }

        $this->bot->sendMessage("1517511920", "📰 <b>Письмо от <code>$chatId</code></b>\n\n$userInfo\n$text");
        $this->bot->sendMessage($chatId, "☑️ Ваше сообщение отправлено");
    }
}
