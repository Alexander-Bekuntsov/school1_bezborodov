<?php

class CancelTimetableCommand
{
    private Bot $bot;

    public function __construct(Bot $bot)
    {
        $this->bot = $bot;
    }

    public function execute(array $message): void
    {
        $chatId = $message['chat']['id'];

        if (!$this->bot->isAdmin($chatId)) {
            (new HelpCommand($this->bot))->execute($message);
            return;
        }

        $sql = DB::execute("UPDATE users SET get_timetable=0");
        $this->bot->sendMessage($chatId, "✅ <b>Расписание отозвано</b> в количестве <code>$sql</code>");
    }
}
