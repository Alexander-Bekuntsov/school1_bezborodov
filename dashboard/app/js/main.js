$(function () {
    const pond = FilePond.create(
        document.getElementById("schedule_filepond"), {
            allowMultiple: false,
            instantUpload: true,
            allowProcess: true,
            labelIdle: "Загрузить расписание"
        });

    // slideText($(".js-page-title"), "Вывод статуса на экран");

    pond.setOptions({
        server: {
            process: (fieldName, file, metadata, load, error, progress, abort) => {
                let filepond_data = new FormData();
                filepond_data.append("file", file);
                $.ajax({
                    url: `./api/upload/upload_main.php?common=${$("#schedule").data("common")}`,
                    type: "POST",
                    data: filepond_data,
                    processData: false,
                    contentType: false,
                    xhr: function () {
                        let xhr = new window.XMLHttpRequest();
                        xhr.upload.onprogress = function (event) {
                            progress(event.lengthComputable, event.loaded, event.total);
                        };
                        return xhr;
                    },
                    success: function (response) {
                        console.log(response);
                        if (!response.error) {
                            if (response.success !== undefined) {
                                document.location.reload();
                            }
                            load(response);
                        } else {
                            console.error("Ошибка загрузки:", response);
                            slideText($(".js-page-title"), response.error);
                            if (error != null) {
                                error(response.error);
                            }
                        }
                    },
                    error: function (req, message) {
                        console.error(message);
                        error("Ошибка загрузки файла");
                    }
                });
            }
        }
    });
});