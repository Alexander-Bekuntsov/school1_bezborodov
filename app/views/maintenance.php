<script>
    const authWindow = new Window();
    authWindow.open({
        title: "<?= __("window.page_maintenance.title") ?>",
        controls: {
            reset: false
        },
        size: {
            width: 350
        },
        animation: true,
        allow_html: true,
        content: `
            <div class="form">
                <div class="app__logo" style="text-align: center">SMSLOVERS</div>
                <div class="form__title"><?= __("window.page_maintenance.message") ?></div>
                <div class="form__text" style="font-size: 12px;text-align: center"><?= __("window.page_maintenance.text") ?></div>
            </div>
        `
    });
</script>