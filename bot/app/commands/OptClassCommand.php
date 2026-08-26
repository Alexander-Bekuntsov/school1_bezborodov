<?php

class OptClassCommand
{
    private Bot $bot;

    public function __construct(Bot $bot)
    {
        $this->bot = $bot;
    }

    public function execute(array $message): void
    {
        $chatId = $message['chat']['id'];
        $text = $message['text'];

        if (preg_match('/\d+/', $text, $matches)) {
            $num = $matches[0];
        } else {
            $num = null;
        }

        $classes = getLastListOfClasses();
        if ($num !== null) {
            if ($num >= 1 && $num <= 9) {
                $pattern = '/^' . $num . '[^0-9]/u';
            } else {
                $pattern = '/^' . $num . '/u';
            }
            $classes = array_values(array_filter($classes, function ($item) use ($pattern) {
                return preg_match($pattern, $item);
            }));
        }

        $keyboard = array_chunk(
            array_map(fn($class) => Keyboard::replyButton($class), $classes),
            3
        );

        $keyboard[] = [Keyboard::replyButton("Выбрать другую параллель")];

        $this->bot->sendMessage(
            $chatId,
            "🅰️ Выберите цифру и букву своего класса",
            Keyboard::reply($keyboard)
        );
    }
}
