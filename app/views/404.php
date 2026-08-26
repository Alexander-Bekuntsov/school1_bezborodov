<script>
    const authWindow = new Window();
    authWindow.open({
        title: "Ошибка",
        controls: {
            reset: false
        },
        animation: true,
        allow_html: true,
        content: `
            <div class="form">
                <div class="app__logo" style="text-align: center">BEZBORODOV</div>
                <div class="form__title">Такой страницы нет</div>
                <div class="form__text" style="font-size: 12px;text-align: center">Мы еще ее не придумали</div>
                <div class="form__controls">
                    <a href="/dashboard/app/">
                        <button class="btn">На главную</button>
                    </a>
                </div>
            </div>
        `
    });
</script>