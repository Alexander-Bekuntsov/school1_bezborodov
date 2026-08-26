<script>
    const authWindow = new Window();
    authWindow.bindForm({
        window: {
            title: 'Идентификация',
            controls: {
                reset: false
            },
            animation: true,
            allow_html: true,
            size: {
                width: 265
            },
        },
        appendFormHTML: `<div class="app__logo">BEZBORODOV</div>`,
        fields: [
            {name: 'username', type: 'text', placeholder: 'Логин', required: true},
            {name: 'password', type: 'password', placeholder: 'Ключ доступа', required: true}
        ],
        submitText: 'Продолжить',
        url: './api/auth/auth.php',
        method: 'POST',
        onSuccess: (response) => {
            authWindow.close();
            location.reload();
        }
    });
</script>