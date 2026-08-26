<script>
    const authWindow = new Window();
    authWindow.open({
        title: "Ошибка загрузки",
        controls: {
            reset: false
        },
        animation: true,
        allow_html: true,
        size: {
            width: 400
        },
        content: `
            <div class="form">
                <div class="app__logo" style="text-align: center">BEZBORODOV</div>
                <div class="form__title">Ошибка</div>
                <div class="form__text" style="font-size: 12px;text-align: center">Мы уже работаем над решением проблемы</div>
            </div>
        `
    });
</script>