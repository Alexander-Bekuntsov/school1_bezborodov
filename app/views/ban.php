<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/../functions/core.php"; ?>
<script>
    const authWindow = new Window();
    authWindow.open({
        title: "<?= __("window.blocked.title") ?>",
        controls: {
            reset: false
        },
        animation: true,
        allow_html: true,
        content: `
            <div class="form">
                <div class="app__logo" style="text-align: center">SMSLOVERS</div>
                <div class="form__title"><?= __("window.blocked.message") ?></div>
                <div class="form__text" style="font-size: 12px;text-align: center"><?= __("window.blocked.text") ?></div>
                <div class="form__controls">
                   <a href="<?= CONTACT ?>">
                        <button class="btn"><?= __("window.blocked.contact") ?></button>
                    </a>
                </div>
                <a href="/api/auth/logout.php?redirect=on">
                    <button class="btn"><?= __("window.blocked.switch_account") ?></button>
                </a>
            </div>
        `
    });
</script>