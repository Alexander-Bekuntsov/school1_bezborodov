<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/functions/core.php";

class GetCommonTimetableCommand
{
    private Bot $bot;

    public function __construct(Bot $bot)
    {
        $this->bot = $bot;
    }

    /**
     * @throws Exception
     */
    public function execute(array $user, array $message, string $day, string $class, int $messageId): void
    {
        $chatId = $message['chat']['id'];
        $timetable = getLessonsByDateFromCommonTtimeTable($day, $class);
        $classList = $user["class_list"] ?? null;

        $row = [];
        if (count($timetable)) {
            $text = getScheduleEmoji() . " <b>" . getFullWeekdayName($day) . "</b>, расписание для <b>" . $class . "</b>\n\n";
            $text .= generateTimetableByArray($timetable);

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
            $userClass = current(array_diff($classes, [$class]));
            if (count($classes) === 2) {
                $row[] = Keyboard::button("Расписание " . $userClass . " класса", "cmd:common-timetable_$userClass" . "_$day");
            } else if (count($classes) > 1) {
                $row[] = Keyboard::button("Сменить класс", "cmd:common-class-timetable");
            }
            $row[] = Keyboard::button("Выбрать день недели", "cmd:common-week-timetable_$class");
        } else {
            $text = "⌚ Постоянное расписание еще не было загружено";
        }
        $row = [$row];
        $row[] = [Keyboard::button("Закрыть", "close")];
        $keyboard = ['inline_keyboard' => $row];

        if ($messageId) {
            $this->bot->editMessage($chatId, $messageId, $text, $keyboard);
        } else {
            $this->bot->sendMessage($chatId, $text, $keyboard);
        }
    }
}
