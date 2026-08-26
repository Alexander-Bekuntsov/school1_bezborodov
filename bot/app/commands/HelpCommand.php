<?php

class HelpCommand
{
    private Bot $bot;

    public function __construct(Bot $bot)
    {
        $this->bot = $bot;
    }

    public function execute(array $message, $keyboard = null): void
    {
        $chatId = $message['chat']['id'];
        $this->bot->sendMessage($chatId, "
📝 Инструкция по добавлению классов и параллелей

<b>✅ Добавление нескольких классов</b>
Укажите их через запятую.
Пример: <code>10А, 11В</code>

<b>✅ Добавление параллели</b>
Напишите только номер класса.
Пример: <code>10</code> или несколько — <code>10, 11</code>

<b>✅ Комбинированный вариант</b>
Можно указать и классы, и параллели вместе.
Пример: <code>10, 11В</code>

✏ <b>Напишите нужный вариант в чат.</b>", $keyboard);
    }
}
