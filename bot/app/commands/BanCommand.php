<?php

class BanCommand
{
    private Bot $bot;

    public function __construct(Bot $bot)
    {
        $this->bot = $bot;
    }

    public function execute(array $message, string $userChatId, bool $ban = true): void
    {
        $chatId = $message['chat']['id'];

        if (!$this->bot->isAdmin($chatId)) {
            (new HelpCommand($this->bot))->execute($message);
            return;
        }

        if ($this->bot->isAdmin($userChatId)) {
            $this->bot->sendMessage($chatId, "❌ Нельзя выдать блокировку <b>администратору</b>");
            return;
        }

        $state = $ban ? 0 : 1;

        $sql = DB::execute("UPDATE users SET access=? WHERE chat_id=?", [$state, $userChatId]);
        if ($sql == 0) {
            $this->bot->sendMessage($chatId, "❌ Пользователь <b>не найден</b> или изменений <b>не было</b>");
            return;
        }
        if ($ban) {
            $this->bot->sendMessage($chatId, "✅ <b>Пользователь</b> был заблокирован");
        } else {
            $this->bot->sendMessage($chatId, "☑️ <b>Пользователь</b> был разблокирован");
        }
    }
}
