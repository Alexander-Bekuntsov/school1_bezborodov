<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/functions/core.php";

class WeekCommonTimetableCommand
{
    private Bot $bot;

    public function __construct(Bot $bot)
    {
        $this->bot = $bot;
    }

    /**
     * @throws Exception
     */
    public function execute(array $message, string $class, int $messageId = null): void
    {
        $chatId = $message['chat']['id'];
        $keyboardData = [];
        $weekDaysArr = [];
        foreach (getShortWeekdays() as $day) {
            $weekDaysArr[] = Keyboard::button($day, $this->bot->cmd("common-timetable", $class, $day));
        }
        $keyboardData[] = $weekDaysArr;
        $keyboardData[] = [Keyboard::button("Закрыть", "close")];
        $keyboard = ['inline_keyboard' => $keyboardData];

        $text = "📌 Выберите день, который вас интересует в постоянном расписании";
        if ($messageId) {
            $this->bot->editMessage($chatId, $messageId, $text, $keyboard);
        } else {
            $this->bot->sendMessage($chatId, $text, $keyboard);
        }
    }
}
