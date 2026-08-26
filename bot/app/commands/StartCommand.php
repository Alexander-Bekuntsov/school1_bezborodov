<?php

class StartCommand
{
    private Bot $bot;

    public function __construct(Bot $bot)
    {
        $this->bot = $bot;
    }

    public function execute(array $message): void
    {
        $chatId = $message['chat']['id'];
        $keyboard = Keyboard::inline([
            [Keyboard::button("Say Hello", "say_hello")],
            [Keyboard::button("Say Bye", "say_bye")]
        ]);

        $this->bot->sendMessage($chatId, "Привет! Нажмите кнопку:", $keyboard);
    }
}
