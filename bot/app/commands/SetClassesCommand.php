<?php

class SetClassesCommand
{
    private Bot $bot;

    public function __construct(Bot $bot)
    {
        $this->bot = $bot;
    }

    public function execute(array $message): void
    {
        $chatId = $message['chat']['id'];

        $classes = ["1A", "2B", "10A", "3B", "4C", "5A", "11B"];

        $keyboard = array_chunk(
            array_map(fn($class) => Keyboard::replyButton($class), $classes),
            3
        );

        $keyboard[] = [Keyboard::replyButton("Выбрать несколько классов")];
        $keyboard[] = [Keyboard::replyButton("Выбрать параллель")];
        $keyboard[] = [Keyboard::replyButton("Оставить без изменений")];

        $this->bot->sendMessage(
            $chatId,
            "✏️ Выберите свой класс",
            Keyboard::reply($keyboard)
        );
    }
}
