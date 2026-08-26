var globalWindowConfig = {
    events: {
        open: null,
        close: null,
        requestSuccess: null,
        requestError: null,
    },
};

class Window {
    config = {
        table: {
            after: undefined,
            emptyResult: null
        },
        lastQuery: {
            url: null,
            requestData: {},
            limit: {
                list: null,
                hide: false,
            },
        },
        checkboxFilters: null,
        events: {
            refresh: null,
            request: null,
            emptyResult: null,
        },
    };

    __highlightElement(selector, duration = 700) {
        var $el = $(selector);
        if ($el.length === 0) return;

        // Добавляем класс для анимации
        $el.addClass('highlight-anim active');

        // Через время убираем
        setTimeout(function () {
            $el.removeClass('active');

            // Через переход удаляем класс полностью
            setTimeout(function () {
                $el.removeClass('highlight-anim');
            }, 500);
        }, duration);
    }

    // Инициализация окна
    open({
             // Разрешить перетаскивать окно мышкой
             drag = true, // boolean
             // Родитель окна
             container = $("body"), // jquery el
             // Заголовок окна
             title = "окно", // string
             // Инициализация начальной анимации окна при drag: true
             animation = true,
             // Интеграция API
             api = {
                 // URL запроса
                 url: null, // string
                 // Метод запроса
                 method: "post", // string
                 // Тип запроса
                 dataType: "json", // string
                 // Преобразовать ответ в таблицу
                 parse_table: false, // boolean
                 // Колонки таблицы из ответа сервера при parse_table: true
                 tableCols: [], // list
                 // Сортировка по колонке
                 filter: true,
                 // HTML-контент после таблицы
                 afterTable: null,
                 // Отправить запрос только после завершения анимации появления окна при animation: true
                 after_animation: false,
                 // Обрезать текст в таблице если он большой через "..." при parse_table: true
                 shortText: {
                     // Включить метод
                     allow: false,
                     // Длина после которой текст будет обрезан
                     maxlen: 20,
                     // Добавить атрибут в элемент содержащий полный текст
                     // helper: "data-text"
                     helper: null, // string
                 },
                 // Вывод при пустом результате
                 emptyResult: null,
                 // Вызов функций при успешном и не успешном запросе к API
                 request: {
                     // Данные запроса
                     data: null, // array
                     // Данные запроса всегда с data при data != null
                     requiredData: null, // array
                     // Вызов пользовательской функции success() при успешном запросе
                     success: null, // function
                     // Вызов пользовательской функции error() при не успешном запросе
                     error: null, // function
                 },
                 // Лимит на отображение строк, при использовании все поля обязательны
                 limit: {
                     // Включить лимит, будет добавлен к запросу параметр limit: int
                     allow: false, // boolean
                     // Скрыть переключатель, если в целом полей меньше, чем первое значение limit.list.
                     // EXAMPLE: Не имеет смысла при limit.list: [20, 50, 100] и query_count: 3
                     // Для работы API должно отдавать общее количество всех существующих полей в query_count
                     hide: false, // boolean
                     // Варианты переключения, например: [20, 50, 100]
                     list: null, // list
                 },
             },
             // Кнопки в шапке окна
             controls = {
                 // Если drag: true, то окно будет центрировано
                 reset: false, // boolean
                 // Если включено api, и limit.allow: true и limit.list задан, - будет активен выбор количества загружаемых строк
                 limit: false, // boolean
                 // Обновить окно и данные в нем
                 refresh: false, // boolean
                 // Закрыть окно
                 close: false, // boolean
                 // Добавление пользовательских кнопок
                 custom: {
                     // Управление через window.getControls("name-type")
                     // window.getControls("name-type").on("click", function() {});
                     "name-type": {
                         // string
                         text: "value-text", // string
                         alt: "alt-text-hover", // string
                     },
                 },
             },
             isStatic = false,
             // Контент окна при отсутствии API
             content = "hello world, i`m <b>alex</b>", // string
             // Разрешить HTML в content
             allow_html = false, // boolean
             // ID окна
             id = "", // string
             // Управление классами окна
             className = "", // string
             modifiers = [], // e.g., ['fullscreen', 'dark'] // array list string
             // Генерация окна изначально с нулевыми значениями высоты и ширины при drag: false
             // Полезно при добавлении окна в какой-либо блок для избежания визуальных скачков
             dynamicAppend = false,
             // Пользовательские размеры окна
             size = {
                 // Ширина окна в px
                 width: "max-content", // string
                 // Высота окна в px
                 height: "max-content", // string
             },
             // Сценарии поведения
             events = {
                 // Закрытие окна при нажатии escape при drag: true
                 escape: true,
             },
             formConfig = null,
             checkboxFiltersConfig = null
         }) {
        if (container.length === 0) {
            container = $("body");
            this.error("контейнера не существует, окно было перемещено в body");
        }
        const controlsHTML = this.generateControls(controls);

        // drag = drag.allow === undefined ? drag : drag.allow;

        if (dynamicAppend) {
            drag = true;
        }

        let innerContent = "";
        if (api.url && api.parse_table) {
            innerContent = this.generateTable(api.tableCols);
        } else {
            innerContent = allow_html ? content : this.stripHTML(content);
        }

        this.topic = title;
        this.config.api = api;

        const currentWindow = $(".window:not(.window-static) .window__controls span").filter(function () {
            return $(this).text() === title;
        });

        if (currentWindow.length) {
            setTimeout(() => {
                const $tWin = currentWindow.closest(".window");
                this.__highlightElement($tWin);
                $tWin.css("z-index", 999);
            }, 100);
            return;
        }

        var classList = ["window", ...modifiers, className];
        if (animation && drag) {
            classList.push("window-hide");
        }
        if (events.escape && drag) {
            classList.push("window-escape-close");
        }
        if (drag) {
            $(".window").removeClass("active");
            classList.push("active");
        }
        if (dynamicAppend) {
            classList.push("window-hidden");
        }
        classList = classList.join(" ").trim();
        const attrId = id ? `id="${id}"` : "";
        const attrDrag = drag ? `data-drag` : "";

        const $el = $(`
          <div class="${classList}" ${attrId} ${attrDrag}>
            <div class="window__controls">
              <span>${title}</span>
              <div class="window__controls-group">${controlsHTML}</div>
            </div>
            <div class="window__content">
              <div class="window__container">${innerContent}</div>
            </div>
          </div>
        `);

        container.append($el);
        this.window = $el;
        this.container = container;

        if (api.afterTable != null) {
            this.config.table.after = api.afterTable;
        }
        if (api.emptyResult != null) {
            this.config.table.emptyResult = api.emptyResult;
        }
        if (checkboxFiltersConfig != null) {
            this.config.checkboxFilters = checkboxFiltersConfig;
        }

        try {
            this.config.requiredData = api.request.requiredData;
        } catch (error) {
        }

        const $this = this;

        if (api.url) {
            let requestData = {url: api.url};
            try {
                if (api.request.success) {
                    requestData.success = api.request.success;
                }
                if (api.request.error) {
                    requestData.error = api.request.error;
                }
            } catch (error) {
            }
            if (dynamicAppend) {
                requestData.success = function () {
                    tempSizes = {
                        width: $el.width(),
                        height: $el.height(),
                    };
                    setTimeout(() => {
                        drag = false;
                        $this.setDrag(false);
                        $el.addClass("window-dynamic-append");
                    }, 50);
                    try {
                        api.request.success();
                    } catch (error) {
                    }
                    setTimeout(() => {
                        $el.removeClass("window-hidden");
                        $el.removeClass("window-dynamic-append");
                        $el.css({
                            width: tempSizes.width,
                            // height: tempSizes.height,
                        });
                        $el.animate(
                            {
                                marginLeft: 35,
                            },
                            300
                        );
                    }, 100);
                };
            }
            try {
                if (api.request.data) {
                    requestData.requestData = api.request.data;
                }
            } catch (error) {
            }
            setTimeout(
                () => this.request(requestData),
                api.after_animation && animation ? 200 : 0
            );
        }

        var tempSizes = {};

        if (dynamicAppend && !api.url) {
            tempSizes = {
                width: $el.width(),
                height: $el.height(),
            };
            setTimeout(() => {
                drag = false;
                this.setDrag(false);
                $el.addClass("window-dynamic-append");
            }, 50);
        } else {
            $el.width(size.width);
            $el.height(size.height);
        }

        if (drag) {
            setTimeout(() => {
                windowDragInit();
            }, 100);
        }

        if (isStatic) {
            $el.addClass("window-static");
        }

        if (dynamicAppend && !api.url) {
            setTimeout(() => {
                $el.removeClass("window-hidden");
                $el.removeClass("window-dynamic-append");
                $el.css({
                    width: tempSizes.width,
                    height: tempSizes.height,
                });
                $el.animate(
                    {
                        marginLeft: 35,
                    },
                    300
                );
            }, 200);
        }

        if (animation && drag) {
            setTimeout(() => {
                $el.removeClass("window-hide");
            }, 100);
        }

        this.getControls("refresh").on("click", function () {
            $this.refresh();
        });

        this.getControls("close").on("click", function () {
            $this.close();
        });

        if (controls.limit && api.limit.allow && api.limit.list != null) {
            this.config.lastQuery.limit.list = api.limit.list;
            this.getControls("limit").attr(
                "data-limit",
                this.config.lastQuery.limit.list[0]
            );
            this.getControls("limit").on("click", function () {
                var position =
                    $.inArray($(this).data("limit"), $this.config.lastQuery.limit.list) +
                    1;
                if (position >= $this.config.lastQuery.limit.list.length) {
                    position = 0;
                }
                $(this).data("limit", $this.config.lastQuery.limit.list[position]);
                var limitVal = $(this).data("limit");
                $el.data("limit", limitVal);
                $(this).text(`${limitVal} строк`);
                $this.request({
                    url: api.url,
                    requestData: {
                        limit: limitVal,
                    },
                });
            });
        }

        // $el.on("click", "[data-filter]", function () {
        //     const col = $(this).closest("th");
        //     col.attr("data-filter", col.attr("data-filter") === "true" ? "false" : "true");
        //     $this.request({
        //         url: api.url,
        //         requestData: {
        //             windowFilter: col.data("type")
        //         }
        //     });
        // });

        // if (api.filter) {
        //     // Объект для хранения направления сортировки по колонкам
        //     const sortDirections = {}; // {id: "ASC", summ: "DESC", ...}
        //
        //     $el.on("click", "th", function () {
        //         const $th = $(this);
        //         const column = $th.data("type");
        //
        //         if (!column) return;
        //
        //         // Текущее направление или ASC по умолчанию
        //         let currentDirection = sortDirections[column] || "ASC";
        //
        //         // Переключаем направление
        //         const newDirection = currentDirection === "ASC" ? "DESC" : "ASC";
        //
        //         // Сохраняем новое направление для этой колонки
        //         sortDirections[column] = newDirection;
        //
        //         console.log(sortDirections); // Для отладки
        //
        //         // Отправка запроса
        //         $this.request({
        //             url: api.url,
        //             requestData: {
        //                 filterColumn: column,
        //                 filterDirection: newDirection
        //             }
        //         });
        //     });
        // }

        $el.on('click', '.window-select__option', function () {
            const $option = $(this);
            const $wrapper = $option.closest('.window-select');
            const fieldName = $wrapper.data('name');
            const value = $option.data('value');

            $wrapper.find(`input[name="${fieldName}"]`).val(value);

            const fieldConfig = (formConfig.fields || []).find(f => f.name === fieldName);
            if (fieldConfig && typeof fieldConfig.onChange === 'function') {
                fieldConfig.onChange($(this).text());
            }
        });

        setTimeout(
            () => {
                $el.find("[data-window-focus]").focus();
            },
            api.after_animation && animation ? 200 : 0
        );

        if (globalWindowConfig.events.open) {
            globalWindowConfig.events.open();
        }

        return $el;
    }

    // Запрос в API
    request({
                // URL запроса к серверу
                url = "./",
                // Метод подключения
                method = "post",
                // Тип запроса
                dataType = "json",
                // Данные запроса
                requestData = {},
                // Пересчитать колонки, если ответ не соответствует количеству текущих колонок
                calcCols = false,
                // Функция при успешном запросе
                success = null,
                // Функция при ошибке запроса
                error = null,
            } = {}) {
        this.reset();
        this.setLoading();
        this.config.lastQuery.url = url;

        if (this.config.events.request) {
            this.config.events.request();
        }

        if (this.config.requiredData) {
            $.each(this.config.requiredData, function (indexInArray, valueOfElement) {
                requestData[indexInArray] = valueOfElement;
            });
        }

        const $this = this;
        $.ajax({
            url: url,
            method: method,
            dataType: dataType,
            data: requestData,
            success: function (data) {
                if (data.status != "ok") {
                    if (data.status == "error") {
                        $this.setError(data.callback);
                    }
                    return;
                }

                var callbackHTML = "";
                var tableMaskHeadHTML = "";
                var resultCount = 1;
                var callbackHTML = "";
                var tableMaskHeadHTML = "";
                var resultCount = 1;
                const allowedCols = $this.getTableCols().map((col) => col.type); // Массив допустимых ключей: ["id", "balance", "phone_count"]

                $.each(data.result, function (indexInArray, valueOfElement) {
                    var rowHTML = "";

                    // Отметка активной строки при поиске по номеру
                    if (requestData.search_phone !== undefined && indexInArray !== 0) {
                        callbackHTML += "<tr class='tr-active'>";
                    } else {
                        callbackHTML += "<tr>";
                    }

                    // Генерация ячеек только для известных колонок
                    allowedCols.forEach(function (colKey) {
                        const cellValue =
                            valueOfElement[colKey] !== undefined
                                ? valueOfElement[colKey]
                                : "";
                        var fullText = $this._checkHTMLPattern(cellValue);
                        try {
                            if ($this.config.api.shortText.allow) {
                                fullText =
                                    fullText.length > $this.config.api.shortText.maxlen
                                        ? `<span ${$this.config.api.shortText.helper
                                        }="${fullText}">${fullText.slice(
                                            0,
                                            $this.config.api.shortText.maxlen
                                        )}...</span>`
                                        : fullText;
                            }
                        } catch (error) {
                        }
                        rowHTML += `<td>${fullText}</td>`;
                    });

                    tableMaskHeadHTML += `<th>${resultCount}</th>`;
                    callbackHTML += rowHTML + "</tr>";
                    resultCount++;
                });

                tableMaskHeadHTML += `<th>${resultCount}</th>`;

                // if (data.result.length === 0) {
                //     if ($this.config.events.emptyResult) {
                //         $this.config.events.emptyResult();
                //     } else {
                //         const emptyCfg = $this.config.table.emptyResult;
                //
                //         if (emptyCfg?.allow) {
                //             if (emptyCfg.topic?.length > 0) {
                //                 $this.setTopic(emptyCfg.topic);
                //             } else {
                //                 $this.setContentHTML("<div class='window-empty'>Результатов нет</div>");
                //             }
                //         } else {
                //             $this.setTopic("Результатов нет");
                //         }
                //     }
                // }

                var animDuration = 100;
                $this.window.find("tbody").fadeOut(animDuration, function () {
                    $(this).html(callbackHTML).fadeIn(animDuration);
                });

                if ($this.window.find("thead th").length != resultCount && calcCols) {
                    $this.window.find("thead").html(tableMaskHeadHTML);
                }

                if ($this.config.table.after) {
                    $this.window.find(".window__container").append($this.config.table.after);
                }

                var animDuration = 100;
                $this.window.find("tbody").fadeOut(animDuration, function () {
                    $(this).html(callbackHTML).fadeIn(animDuration, function () {
                        const $table = $this.window.find("table");

                        if ($.fn.DataTable.isDataTable($table)) {
                            $table.DataTable().destroy();
                            $table.find("tbody").children().unwrap();
                        }

                        const langCode = $("html").attr("lang") ?? "en";

                        // Инициализируем DataTable с ColReorder
                        let dtConfig = {
                            "pageLength": 50,
                            "lengthMenu": [5, 10, 25, 50],
                            stateSave: true,
                            searching: true,
                            paging: true,
                            info: false,
                            lengthChange: true,
                            colReorder: true,
                            autoWidth: false,
                            responsive: true,
                            drawCallback: function (settings) {
                                const api = this.api();
                                const pageInfo = api.page.info();
                                const $paginate = $(api.table().container()).find('.dt-layout-cell:has(.dt-paging)');
                                const $topRow = $(api.table().container()).find('.dt-layout-row:has(.dt-length)');
                                const $length = $(api.table().container()).find('.dt-layout-cell:has(.dt-length)');
                                const $filter = $(api.table().container()).find('.dt-layout-cell:has(.dt-search)');

                                // Скрываем пагинацию, если одна страница
                                $paginate.toggle(pageInfo.pages > 1);

                                // Скрываем topRow, если мало записей
                                $topRow.toggle(!(pageInfo.recordsTotal < 2 && pageInfo.recordsTotal <= 1));

                                // Если меньше 2 строк, скрываем выбор количества записей
                                $length.toggle(pageInfo.recordsTotal >= 2);

                                // Если всего одна строка, отключаем поиск
                                $filter.toggle(pageInfo.recordsTotal > 1);
                            }
                        };
                        if (langCode !== "en") {
                            dtConfig.language = {
                                url: `https://raw.githubusercontent.com/DataTables/Plugins/refs/heads/master/i18n/${langCode}.json`,
                                lengthMenu: "Показать _MENU_"
                            }
                        }
                        const table = new DataTable($table[0], dtConfig);

                        /**
                         * Универсальные чекбокс-фильтры для таблицы
                         * @param {jQuery} $table - таблица jQuery
                         * @param {Object} config - настройки
                         *    filterColumns: [0,1,...] - какие колонки фильтровать
                         *    manualValues: { colIndex: [...] } - ручные значения
                         *    defaultFilters: { colIndex: [...] } - значения по умолчанию
                         *    useDataTables: true/false
                         *    selectAllLabel: 'Все'
                         *    onFilterChange: function(payload) {}
                         */
                        function addCheckboxFilters($table, config = {}) {
                            if (!$table || !$table.length) return;

                            const settings = $.extend({
                                useDataTables: true,
                                filterColumns: [],
                                filterType: {},
                                manualValues: {},
                                defaultFilters: {},
                                selectAllLabel: 'Все',
                                onFilterChange: null,
                                getTitle: () => window?.$this?.getTopic?.() || '',
                                setTitle: txt => window?.$this?.setTopic?.(txt),
                                debug: false
                            }, config);

                            const dt = settings.useDataTables && $.fn.dataTable ? $table.DataTable() : null;
                            const $ths = $table.find('thead th');
                            if (!$ths.length) return;

                            const stripHtml = html => html == null ? '' : $('<div>').html(html).text().trim();
                            const targetCols = (settings.filterColumns || []).filter(i => i >= 0 && i < $ths.length);
                            if (!targetCols.length) {
                                if (settings.debug) console.warn('addCheckboxFilters: нет колонок для фильтрации', $table);
                                return;
                            }

                            // Функция обновления заголовка
                            const updateTableTitle = (colIndex, checkedVals, allValues, dtInstance, stripHtmlFn) => {
                                const totalRows = dtInstance ? dtInstance.rows({ search: 'applied' }).data().length : $table.find('tbody tr:visible').length;
                                const baseTitle = $this.getTopic();
                                let cleanTitle = baseTitle.replace(/\s*\(фильтр:.*?\)$/, '');
                                let text = checkedVals.join(', ');

                                if (!text) text = 'Нет данных';
                                else if (checkedVals.length === allValues.length) text = settings.selectAllLabel;

                                $this.setTopic(`${cleanTitle} (фильтр (${totalRows}): ${text})`);
                            };

                            targetCols.forEach(colIndex => {
                                const $th = $ths.eq(colIndex);
                                if ($th.data('checkboxFilter')) return;
                                $th.data('checkboxFilter', true).css('position', 'relative');

                                const $btn = $('<button type="button" class="filter-btn" aria-label="Фильтр">☰</button>');
                                const $menu = $('<div class="custom-filter-menu"></div>').hide();
                                $th.append($btn, $menu);

                                let values = [];
                                if (Array.isArray(settings.manualValues[colIndex])) {
                                    values = settings.manualValues[colIndex];
                                } else if (dt) {
                                    values = dt.column(colIndex, { search: 'none' }).data().toArray();
                                } else {
                                    $table.find('tbody tr').each(function() {
                                        values.push($(this).find(`td:eq(${colIndex})`).html() || '');
                                    });
                                }

                                const uniq = [...new Set(values.map(stripHtml))].filter(Boolean).sort((a,b) => a.localeCompare(b));
                                if (!uniq.length) {
                                    $menu.append('<div class="no-values">Нет значений</div>');
                                    return;
                                }

                                const type = settings.filterType?.[colIndex] || 'checkbox';

        //                         const $selectAll = $(`
        //     <label style="display:block;font-weight:600;">
        //         <input type="checkbox" class="select-all" checked> ${settings.selectAllLabel}
        //     </label>
        // `);
        //                         if (type === 'radio') $selectAll.hide();
        //                         $menu.append($selectAll);

                                uniq.forEach(v => {
                                    const $lbl = $('<label style="display:block;white-space:nowrap;"></label>');
                                    const $input = $('<input />').attr('type', type).prop('checked', true).data('val', v);
                                    $lbl.append($input, ' ' + v);
                                    $menu.append($lbl);
                                });

                                $btn.on('click', e => {
                                    e.stopPropagation();
                                    $('.custom-filter-menu.open').not($menu).removeClass('open').hide();
                                    $menu.toggle().toggleClass('open');
                                });

                                $(document).off('click.customFilter_' + colIndex).on('click.customFilter_' + colIndex, () => {
                                    $('.custom-filter-menu.open').removeClass('open').hide();
                                });

                                $menu.on('click', e => e.stopPropagation());

                                // select-all для checkbox
                                $menu.on('change', '.select-all', function() {
                                    const checked = this.checked;
                                    $menu.find('input[type=checkbox]').not(this).prop('checked', checked).trigger('change', [true]);
                                });

                                const applyFilter = (skipEvent = false) => {
                                    const $checks = $menu.find(`input[type=${type}]:not(.select-all)`);
                                    const total = $checks.length;
                                    const checkedVals = $checks.filter(':checked').map(function() { return $(this).data('val'); }).get();

                                    if (dt && settings.useDataTables) {
                                        const tableNode = dt.table().node();
                                        $.fn.dataTable.ext.search = $.fn.dataTable.ext.search.filter(f => !(f._customFilterCol === colIndex && f._customFilterTable === tableNode));

                                        if (checkedVals.length === total && type === 'checkbox') dt.draw();
                                        else {
                                            const allowed = checkedVals.map(v => stripHtml(v).toLowerCase());
                                            const filterFn = function(settingsDT, data) {
                                                if (settingsDT.nTable !== tableNode) return true;
                                                const cellData = data[colIndex] != null ? data[colIndex] : '';
                                                const text = stripHtml(cellData).toLowerCase();
                                                return allowed.includes(text);
                                            };
                                            filterFn._customFilterCol = colIndex;
                                            filterFn._customFilterTable = tableNode;
                                            $.fn.dataTable.ext.search.push(filterFn);
                                            dt.draw();
                                        }
                                    }

                                    updateTableTitle(colIndex, checkedVals, uniq, dt, stripHtml);

                                    if (!skipEvent && typeof settings.onFilterChange === 'function') {
                                        settings.onFilterChange({ columnIndex: colIndex, values: checkedVals, allValues: uniq });
                                    }
                                };

                                $menu.on('change', `input[type=${type}]:not(.select-all)`, function() {
                                    if (type === 'radio') $menu.find(`input[type=radio]`).not(this).prop('checked', false);
                                    if (type === 'checkbox') {
                                        const checkedN = $menu.find('input[type=checkbox]:not(.select-all):checked').length;
                                        $menu.find('.select-all').prop('checked', checkedN === total);
                                    }
                                    applyFilter();
                                });

                                // defaultFilters — устанавливаем без вызова события
                                const defaultVals = settings.defaultFilters[colIndex];
                                if (Array.isArray(defaultVals) && defaultVals.length) {
                                    $menu.find(`input[type=${type}]:not(.select-all)`).each(function() {
                                        const val = $(this).data('val');
                                        const match = defaultVals.some(d => stripHtml(d).toLowerCase() === val.toLowerCase());
                                        $(this).prop('checked', !!match);
                                    });
                                    if (type === 'checkbox') {
                                        const $checksAfter = $menu.find('input[type=checkbox]:not(.select-all)');
                                        $menu.find('.select-all').prop('checked', $checksAfter.filter(':checked').length === $checksAfter.length);
                                    }
                                    applyFilter(true); // событие onFilterChange не вызывается
                                }

                                // --- сразу обновляем название таблицы после инициализации ---
                                const $checks = $menu.find(`input[type=${type}]:not(.select-all)`);
                                const checkedVals = $checks.filter(':checked').map(function() { return $(this).data('val'); }).get();
                                updateTableTitle(colIndex, checkedVals, uniq, dt, stripHtml);
                            });
                        }

                        $table.on('init.dt draw.dt', function () {
                            addCheckboxFilters($table, $this.config.checkboxFilters);
                        });

                        // Хелпер: убираем все кроме цифр
                        function normalizePhone(phone) {
                            return phone.replace(/\D/g, "");
                        }

                        table.on('column-reorder', function (e, settings, details) {
                            $(table.table().node()).find('th, td').addClass('animating');
                            setTimeout(() => {
                                $(table.table().node()).find('th, td').removeClass('animating');
                            }, 300);
                        });

                        $table.closest('.dt-container').find('.dt-search .dt-input').off().on('keyup', function () {
                            let val = $(this).val();
                            if (/^\+7[\s\d-]*$/.test(val)) {
                                val = normalizePhone(val);
                            }
                            table.search(val).draw();
                        });

                        const pageInfo = table.page.info();
                        const $paginate = $(table.table().container()).find('.dataTables_paginate');
                        if (pageInfo.pages <= 3) {
                            $paginate.hide();
                        } else {
                            $paginate.show();
                        }
                    });
                });

                // if ($this.config.limit.hide) {
                //   $this
                //     .getControls("limit")
                //     .css(
                //       "visibility",
                //       data.query_count != undefined && data.query_count > 20
                //         ? "visible"
                //         : "hidden"
                //     );
                // }

                //   $this.window.find("thead").each(function (index, element) {
                //   if (!skip_change_coltitle.includes($(this).data("type"))) {
                //     $(this).text($(this).data("colvalue"));
                //   }
                // });

                setTimeout(() => {
                    $this.getContainer().css("min-width", $this.getContainer().width());
                    $this.window.find("[data-type]").each(function (index, element) {
                        $(this).width($(this).width());
                    });
                }, 500);

                // windowContainer.toggleClass("table-scroll", data.query_count > 14);
                // if (data.query_count > 14) {
                //   const firstRowHeight = table
                //     .find("thead tr:first-child")
                //     .outerHeight();
                //   table.find("thead tr:nth-child(2)").css("top", firstRowHeight + "px");
                // }

                $this.setLoading(false);

                setTimeout(() => {
                    if (typeof success === "function") {
                        success($this, data, requestData);
                    }
                    if (typeof globalWindowConfig.events.requestSuccess === "function") {
                        globalWindowConfig.events.requestSuccess();
                    }
                }, animDuration + 20);
            },
            error: function (jqXHR, exception) {
                $this.error(exception);
                $this.setLoading(false);
                if (jqXHR.status === 0) {
                    $this.setError("нет подключения к сети.");
                } else if (jqXHR.status === 404) {
                    $this.setError("страница не найдена (404).");
                } else if (jqXHR.status === 500) {
                    $this.setError("ошибка сервера (500).");
                } else if (exception === "parsererror") {
                    $this.setError("ошибка чтения данных.");
                } else if (exception === "timeout") {
                    $this.setError("время ожидания вышло.");
                } else if (exception === "abort") {
                    $this.setError("запрос прерван.");
                } else {
                    $this.setError("неизвестная ошибка.");
                }
                if (jqXHR.status === 403) {
                    $this.setError("Сбавьте темп — подождите немного");
                }
                if (typeof error === "function") {
                    error($this, requestData);
                }
                if (typeof globalWindowConfig.events.requestSuccess === "function") {
                    globalWindowConfig.events.requestError();
                }
            },
        });
    }

    // Не включено в документацию
    stripHTML(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    }

    // Сгенерировать controls в шапке окна
    generateControls(controls) {
        const buttons = [];
        if (controls.limit) {
            buttons.push(`
          <button class="window__controls-btn bzb-window-limit" 
                  title="Сменить количество строк" 
                  data-limit="20">20 строк</button>`);
        }
        $.each(controls.custom, function (indexInArray, valueOfElement) {
            buttons.push(`
        <button class="window__controls-btn bzb-window-${indexInArray}" alt="${valueOfElement.alt}">${valueOfElement.text}</button>`);
        });
        if (controls.reset) {
            buttons.push(`
          <button class="window__controls-btn bzb-window-reset" 
                  title="Позиционировать окно">По центру</button>`);
        }
        if (controls.refresh) {
            buttons.push(`
          <button class="window__controls-btn bzb-window-refresh" 
                  title="Перезагрузить окно">Обновить</button>`);
        }
        if (controls.close) {
            buttons.push(`
          <button class="window__controls-btn bzb-window-close" 
                  title="Закрыть окно">Закрыть</button>`);
        }
        return buttons.join("");
    }

    // Обновить кнопки управления
    setControls(controls) {
        this.window
            .find("sd.window__controls-group")
            .html(this.generateControls(controls));
    }

    generateTable(cols = []) {
        this.config.tableCols = cols;
        const headers = cols
            .map((col) => {
                const filterAttr = col.filter ? ' data-filter="true"' : "";
                const title = col.filter ? `<span class="window-col-filter">${col.title}</span>` : col.title;
                return `<th data-type="${col.type}"${filterAttr}>${title}</th>`;
            })
            .join("");

        return `
      <table>
        <thead>
          <tr>${headers}</tr>
        </thead>
        <tbody>${this.generateTableBody(cols)}</tbody>
      </table>`;
    }

    getTableCols() {
        return this.config.tableCols ?? null;
    }

    // Сгенерировать таблицу исходя из колонок
    generateTableBody(cols = []) {
        const body = `<tr>${cols
            .map(() => `<td><div class='shimmer'>↺</div></td>`)
            .join("")}</tr>`;
        return body;
    }

    // Назначить глобальную пользовательскую функцию при успешном запросе при наличии api
    static onGlobalRequestSuccess(fun) {
        globalWindowConfig.events.requestSuccess = fun;
    }

    // Назначить глобальную пользовательскую функцию при не успешном запросе при наличии api
    static onGlobalRequestError(fun) {
        globalWindowConfig.events.requestError = fun;
    }

    // Назначить глобальную пользовательскую функцию при open() для всех окон
    static onGlobalCreate(fun) {
        globalWindowConfig.events.open = fun;
    }

    // Назначить глобальную пользовательскую функцию при close() для всех окон
    static onGlobalClose(fun) {
        globalWindowConfig.events.close = fun;
    }

    // Вызов ошибки в окне
    setError(message = null) {
        if (message) {
            this.setTopic(message);
        }
        this.window.addClass("window-error");
    }

    // Убрать состояние ошибки
    removeError() {
        this.setTopic(this.getTopic());
        this.window.removeClass("window-error");
    }

    // Получить колонку таблицы по типу
    getTableColByType(type) {
        return this.window.find(`table thead [data-type="${type}"]`);
    }

    // Получить строки таблицы tr как JQuery object
    getTableRowsDOM() {
        return this.window.find("table tbody tr");
    }

    // Задать название окна
    setTopic(topic) {
        this.getTitle().text(topic);
    }

    // Получить текущее название окна
    getCurrentTopic(topic) {
        this.getTitle().text();
    }

    // Получить окно как jquery object
    getWindow() {
        return this.window;
    }

    // Получить исходное (первое) название окна
    getTopic(topic) {
        return this.topic;
    }

    // Получить элемент названия окна
    getTitle(topic) {
        return this.window.find(".window__controls span");
    }

    // Получить элемент control окна
    getControls(name = "btn") {
        return this.window.find(`.bzb-window-${name}`);
    }

    // Получить главный элемент-контейнер в котором находится весь контент окна
    getContainer() {
        return this.window.find(".window__container");
    }

    // Не включать в документацию
    error(message) {
        console.error(`window.js: ${message}`);
    }

    // Задать окну новый HTML-контент
    setContentHTML(html) {
        this.window.find(".window__container").html(html);
    }

    // Задать окну новый контент
    setContent(content) {
        this.window.find(".window__container").text(content);
    }

    // Задать пользовательское событие при вызове refresh()
    onRefresh(fun) {
        if (typeof fun === "function") {
            this.config.events.refresh = fun;
        }
    }

    // Задать пользовательское событие при вызове close()
    onClose(fun) {
        if (typeof fun === "function") {
            this.config.events.close = fun;
        }
    }

    // Задать пользовательское событие при вызове emptyResult()
    onEmptyResult(fun) {
        if (typeof fun === "function") {
            this.config.events.emptyResult = fun;
        }
    }

    // Задать пользовательское событие при вызове request()
    onRequest(fun) {
        if (typeof fun === "function") {
            this.config.events.request = fun;
        }
    }

    /**
     * Универсальный метод для привязки формы к окну
     * @param {Object} config
     *  config: {
     *      title: string,
     *      fields: [{name, type, placeholder, class, tippy, required, value}],
     *      submitText: string,
     *      submitAllow: boolean,
     *      url: string,
     *      method: 'POST'|'GET',
     *      onSuccess: function(response),
     *      onError: function(error)
     *  }
     */
    bindForm(config) {
        // Генерируем HTML формы
        let formHTML = `<${config.submitAllow !== false ? "form" : "div"} id="windowForm" class="form">`;

        if (config.window?.allow_html) {
            if (config.appendFormHTML !== undefined) {
                formHTML += config.appendFormHTML;
            }
            if (config.appendSubtitle === undefined) {
                formHTML += `<div class="form__title">${config.window.title || ''}</div>`;
            }
        }

        if (config.fields !== undefined) {
            formHTML += `<div class="form__dependence">`;
            config.fields.forEach(field => {
                let fieldHTML = '';

                if (field.type === 'select') {
                    // Обёртка для кастомного выпадающего списка
                    fieldHTML += `<div class="form__field window-select" data-name="${field.name}" ${field.class ? `class="${field.class}"` : ''}>`;

                    fieldHTML += `
        <div class="window-select__trigger" tabindex="0">
            <span class="window-select__placeholder">${field.placeholder || 'Выберите...'}</span>
            <div class="window-select__arrow"></div>
        </div>
    `;

                    fieldHTML += `<div class="window-select__dropdown">`;

                    if (Array.isArray(field.buttons) && field.buttons.length > 0) {
                        fieldHTML += `<div class="window-select__buttons">`;
                        field.buttons.forEach(btn => {
                            fieldHTML += `<button type="button" class="${btn.class || ''}" data-action="${btn.action || ''}">${btn.label}</button>`;
                        });
                        fieldHTML += `</div>`;
                    }

                    if (Array.isArray(field.options)) {
                        fieldHTML += `<div class="window-select__options">`;
                        field.options.forEach(opt => {
                            fieldHTML += `<div class="window-select__option" data-value="${opt.value}" 
               ${opt.tippy ? `data-tippy="${opt.tippy}" data-tippy-align="left" data-tippy-theme="light"` : ''}>
               ${opt.label}
            </div>`;
                        });
                        fieldHTML += `</div>`;
                    }

                    // API для динамических опций
                    if (field.api) {
                        fieldHTML += `<div class="window-select__options window-select__options--dynamic" 
          data-api-url="${field.api.url}" 
          data-api-method="${field.api.method || 'GET'}"
          data-api-params='${JSON.stringify(field.api.params || {})}'
          data-display-fields='${JSON.stringify(field.displayFields || [])}'
          style="display:none;"></div>`;
                    }

                    fieldHTML += `<input type="hidden" name="${field.name}" value="">`;
                    fieldHTML += `</div></div>`; // закрытие dropdown и обёртки
                } else {
                    // Обычное поле ввода
                    fieldHTML += `
            <div class="form__field input">
                <input type="${field.type || 'text'}" 
                       name="${field.name}" 
                       placeholder="${field.placeholder || ''}" 
                       value="${field.value || ''}"
                       autocomplete="off"
                       ${field.class ? ` class="${field.class}"` : ''} 
                       ${field.tippy ? ` data-tippy="${field.tippy}" data-tippy-align="left" data-tippy-theme="light"` : ''} 
                       ${field.style ? ` style="${field.style}"` : ''} 
                       ${field.dataFocus ? 'data-focus' : ''}
                       ${field.required ? 'required' : ''} 
                       ${field.disabled ? 'disabled' : ''} 
                       ${field.filter?.numeric ? 'data-window-numeric="true"' : ''}
                       ${field.filter?.numericDollar ? 'data-window-price-dollar="true"' : ''} />
            </div>
        `;
                }

                formHTML += fieldHTML;
            });
            formHTML += `</div>`;
        }

        if (config.submitText !== undefined) {
            formHTML += `
                <div class="form__controls">
                    <button${config.submitAllow !== false ? " type=\"submit\"" : ""} class="btn">${config.submitText || 'Отправить'}</button>
                </div>
            </${config.submitAllow !== false ? "form" : "div"}>`;
        }

        // Создаём окно через open
        this.open({
            ...config.window,
            content: formHTML,
            formConfig: config
        });

        let $this = this;

        const $form = $('#windowForm');
        const $submitBtn = $form.find('button[type="submit"]');

        if (config.closeByButton) {
            $(document).on("click", "#windowForm button.btn", function () {
                $this.close();
            });
        }

        $("[data-focus]").focus();

        // Навешиваем сабмит
        $form.on('submit', (e) => {
            e.preventDefault();
            this.removeError();

            const formData = $form.serialize();

            $.ajax({
                url: config.url,
                method: config.method || 'POST',
                data: formData,
                dataType: 'json',
                beforeSend: () => {
                    $submitBtn.prop('disabled', true).text('Отправка...');
                },
                success: (response) => {
                    if (response.status === 'ok') {
                        if (config.onSuccess) config.onSuccess(response);
                    } else {
                        this.setError(response.callback || 'Ошибка на сервере');
                        if (config.onError) config.onError(response);
                    }
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    let msg = 'Ошибка соединения';
                    try {
                        const response = JSON.parse(jqXHR.responseText);
                        if (response.callback) {
                            msg = response.callback;
                        } else if (response.message) {
                            msg = response.message;
                        }
                    } catch (e) {
                        msg += ': ' + jqXHR.status + ' ' + jqXHR.statusText;
                    }

                    this.setError(msg);

                    if (config.onError) {
                        config.onError({
                            status: 'error',
                            message: msg,
                            raw: jqXHR.responseText
                        });
                    }
                },
                complete: () => {
                    $submitBtn.prop('disabled', false).text(config.submitText || 'Отправить');
                }
            });
        });
    }

    // Обновить контент окна повторив последний запрос к серверу, при настроенном api
    refresh(timeout = 0) {
        if (this.config.lastQuery.url == null) {
            return;
        }
        if (this.config.events.refresh) {
            this.config.events.refresh();
        }
        this.reset();
        setTimeout(() => {
            this.request({
                url: this.config.lastQuery.url,
                method: this.config.api.method,
                dataType: this.config.api.dataType,
                requestData: this.config.lastQuery.requestData,
            });
        }, timeout);
    }

    // Вернуть окно к начальному состоянию
    reset() {
        this.setContentHTML(this.generateTable(this.config.api.tableCols));
        this.setLoading(false);
        this.getControls().prop("disabled", false);
        this.setTopic(this.topic);
        this.window.removeClass("window-error");
    }

    // Переключить статус загрузки
    setLoading(state = true /* bool */) {
        this.getTitle().toggleClass("title-loading", state);
    }

    // Закрыть окно
    close() {
        if (this.config.events.close) {
            this.config.events.close();
        }
        if (globalWindowConfig.events.close) {
            globalWindowConfig.events.close();
        }
        this.window.addClass("window-hide");
        setTimeout(() => {
            this.window.remove();
        }, 300);
    }

    // Переключить состояние drag and drop
    setDrag(
        // Состояние
        toggle = true,
        // Включить анимацию и плавно перевести окно в центр родителя (container)
        animation = false
    ) {
        if (toggle) {
            this.window.css("position", "absolute");
            this.window.attr("data-drag", "");
            windowDragInit();
        } else {
            if (!animation) {
                this.window.css("position", "static");
                this.window.removeAttr("data-drag");
                return;
            }
            var containerOffset = this.container.offset();
            var left = containerOffset.left - this.window.width() / 2;
            var top = containerOffset.top;
            this.window.animate(
                {
                    left,
                    top,
                },
                300
            );
            setTimeout(() => {
                this.window.removeAttr("data-drag");
                this.window.css("position", "static");
            }, 300);
        }
    }

    // Статическая функция класса
    // Распределить все окна drag: true на странице с приоритетом на центр окна
    //
    // Пример с использованием onGlobalCreate и onGlobalClose
    // Window.onGlobalCreate(function() {
    //   Window.arrangeWindowsCentered();
    // });
    // Window.onGlobalClose(function() {
    //   Window.arrangeWindowsCentered();
    // });
    static arrangeWindowsCentered() {
        const $windows = $(".window[data-drag]");
        const spacing = 30;
        const screenW = $(window).width();
        const screenH = $(window).height();

        const windowsData = $windows
            .map(function () {
                const $el = $(this);
                return {
                    $el,
                    width: $el.outerWidth(true),
                    height: $el.outerHeight(true),
                };
            })
            .get();

        if (windowsData.length === 0) return;

        // === 1. Попробовать выстроить в один ряд ===
        const totalRowWidth = windowsData.reduce(
            (sum, win, i) => sum + win.width + (i > 0 ? spacing : 0),
            0
        );
        const maxRowHeight = Math.max(...windowsData.map((w) => w.height));

        if (totalRowWidth <= screenW && maxRowHeight <= screenH) {
            // Центрирование по горизонтали
            let x = (screenW - totalRowWidth) / 2;
            const y = (screenH - maxRowHeight) / 2;

            windowsData.forEach((win) => {
                const top = y + (maxRowHeight - win.height) / 2;
                win.$el.animate({left: x, top}, 300).css("position", "absolute");
                x += win.width + spacing;
            });

            return;
        }

        // === 2. Вертикальный flow layout (колонками) ===
        const columns = [];
        let currentColumn = [];
        let currentHeight = 0;
        let maxColumnWidth = 0;

        for (const win of windowsData) {
            if (win.height > screenH) {
                // Если ОДНО окно не помещается по высоте — сразу выходим
                return;
            }

            const nextHeight =
                currentHeight + (currentColumn.length > 0 ? spacing : 0) + win.height;
            if (nextHeight > screenH) {
                // Заканчиваем текущую колонку и начинаем новую
                columns.push({
                    windows: currentColumn,
                    width: maxColumnWidth,
                    height: currentHeight,
                });

                currentColumn = [win];
                currentHeight = win.height;
                maxColumnWidth = win.width;
            } else {
                // Добавляем в текущую колонку
                currentColumn.push(win);
                currentHeight = nextHeight;
                maxColumnWidth = Math.max(maxColumnWidth, win.width);
            }
        }

        // Добавляем последнюю колонку
        if (currentColumn.length > 0) {
            columns.push({
                windows: currentColumn,
                width: maxColumnWidth,
                height: currentHeight,
            });
        }

        // === 3. Проверка: влезает ли по ширине вся колонная раскладка ===
        const totalColumnsWidth = columns.reduce(
            (sum, col, i) => sum + col.width + (i > 0 ? spacing : 0),
            0
        );

        if (totalColumnsWidth > screenW) {
            // Слишком много колонок — не влезает
            return;
        }

        // === 4. Размещение колонок по центру экрана ===
        let x = (screenW - totalColumnsWidth) / 2;

        columns.forEach((col) => {
            const offsetY = (screenH - col.height) / 2;
            let y = offsetY;

            col.windows.forEach((win) => {
                win.$el.animate({left: x, top: y}, 300).css("position", "absolute");
                y += win.height + spacing;
            });

            x += col.width + spacing;
        });
    }

    // Вернуть requiredData при активном requiredData в api.request.requiredData
    getRequiredData() {
        return this.config.requiredData;
    }

    _checkHTMLPattern(value) {
        switch (value) {
            case "<shimmer></shimmer>":
                return "<div class='shimmer'>↺</div>";
            default:
                return value;
        }
    }
}

// Обязательный положительный ответ сервера при использовании api.parse_table
// {
//   "status": "ok",
//   "query_count": 1, // при использовании api.limit
//   "result": [
//       {
//          "name": "value" // value может содержать HTML или window-pattern
//           ... Колонки таблицы
//       }
//   ]
// }
//
// Шаблоны в ответах [window-pattern]:
// -> "<shimmer></shimmer>" - для информации-заглушки
//
// Обязательный негативный ответ сервера при использовании api
// {
//   "status": "error",
//   "callback": "Текст ошибки" // HTML не допускается
// }
//
// Простое создание окна
// const myWindow = new Window();
// myWindow.open({
//   title: "Title",
//   controls: { refresh: true },
//   allow_html: true,
//   content: "Hello world, i`m Alex!",
//   ...
// });
//
// Настройка API с подключением автоматического отображения данных в таблицу
// api: {
//   url: "./api/mtt/phone_list/get_phone_list.php",
//   parse_table: true,
//   tableCols: [
//     { type: "phone", title: "Номер телефона" },
//     { type: "status", title: "Статус номера" },
//     { type: "commit_data", title: "Дата подключения" },
//     { type: "ap_data", title: "Дата АП" },
//   ],
// }
//
// Пример использования функции request()
// myWindow.request({
//   url: "./api/mtt/phone_list/get_phone_list.php",
//   requestData: {
//     sort: "desc",
//   },
//   success: function () {
//     myWindow.setTopic(`${myWindow.getTopic()} (сортирован)`);
//   },
// });
//
// Пример обработки нажатия на кнопки управления
// controls = {
//   refresh: true,
//   custom: {
//     "youtube": {
//       text: "YouTube",
//       alt: "Check in YouTube"
//     },
//   },
// }
//
// window.getControls("refresh").on("click", function () {
//   console.log("click");
// });
// window.getControls("youtube").on("click", function () {
//   console.log("click");
// });

var modalList = [];
const windowPositions = {};

// Главная инициализация
const windowDragInit = () => {
    modalList = [];

    if (
        window.matchMedia("(pointer: fine)").matches === false ||
        $(window).width() < 768
    ) {
        return;
    }

    const $windows = $("[data-drag]").not(".drag-initialized");
    let $currentWindow = null;
    let offset = {x: 0, y: 0};
    let isDragging = false;

    $windows.each(function () {
        const $win = $(this);
        const $reset = $win.find(".reset-btn");
        const id = $win.attr("id");

        // Помечаем окно как уже проинициализированное
        $win.addClass("drag-initialized");

        if (id) modalList.push(id);

        const pos = windowPositions[id] || null;

        $reset.hide();

        if (pos) {
            $win.css({left: pos.left, top: pos.top, position: "absolute"});
            $reset.show();
        } else {
            centerWindow($win);
        }
    });

    function centerWindow($el, animate = false) {
        const w = $(window).width();
        const h = $(window).height();
        const elW = $el.outerWidth();
        const elH = $el.outerHeight();
        const left = (w - elW) / 2;
        const top = (h - elH) / 2;

        if (animate) {
            $el.animate({left, top}, 300);
        } else {
            $el.css({left, top});
        }

        const id = $el.attr("id");
        if (id) windowPositions[id] = {left, top};
    }

    function bringToFront($el) {
        $("[data-drag]").removeClass("active").css("z-index", 500);
        $el.addClass("active").css("z-index", 900);
    }

    $("[data-drag].drag-initialized .window__controls").on(
        "mousedown",
        function (e) {
            if ($(e.target).is("button")) return;
            $currentWindow = $(this).closest(".window");
            bringToFront($currentWindow);

            const pos = $currentWindow.offset();
            offset.x = e.pageX - pos.left;
            offset.y = e.pageY - pos.top;
            isDragging = true;
        }
    );

    $(document).on("mousemove", function (e) {
        if (!isDragging || !$currentWindow) return;

        let left = e.pageX - offset.x;
        let top = e.pageY - offset.y;

        const winW = $(window).width();
        const winH = $(window).height();
        const elW = $currentWindow.outerWidth();
        const elH = $currentWindow.outerHeight();

        left = Math.max(0, Math.min(left, winW - elW));
        top = Math.max(0, Math.min(top, winH - elH));

        $currentWindow.css({left, top});

        const id = $currentWindow.attr("id");
        if (id) windowPositions[id] = {left, top};

        const $reset = $currentWindow.find(".reset-btn");
        if (!$reset.is(":visible")) {
            $reset.fadeIn(100);
        }
    });

    $(document).on("mouseup", function () {
        isDragging = false;
        $currentWindow = null;
    });

    $("[data-drag].drag-initialized").on("mousedown", function () {
        bringToFront($(this));
    });

    $(".bzb-window-reset").on("click", function (e) {
        e.stopPropagation();
        const $win = $(this).closest(".window");
        const id = $win.attr("id");

        if (id && windowPositions[id]) {
            delete windowPositions[id];
        }

        $(this).fadeOut(100);
        centerWindow($win, true);
    });
};

// Закрытие окна по Escape
$(document).on("keydown", function (event) {
    if (event.key == "Escape") {
        var domElem =
            ".window[data-drag].active.window-escape-close:has(.bzb-window-close)";
        const $win = $(domElem);
        if ($win.length > 0) {
            $win.addClass("window-hide");
            setTimeout(() => {
                $win.remove();
                Window.arrangeWindowsCentered();
            }, 300);
        }
    }
});

// Ограничение ввода только цифрами
$(document).on("focus", "[data-window-int]", function () {
    $(this).on("input.restrictDigits", function () {
        this.value = this.value.replace(/\D/g, "");
    });
});

$(document).on("blur", "[data-window-int]", function () {
    $(this).off("input.restrictDigits");
});

// Открытие/закрытие дропдауна
$(document).on('click', '.window-select__trigger', function () {
    const $select = $(this).closest('.window-select');
    const $dropdown = $select.find('.window-select__dropdown');
    const $dynamicBlock = $dropdown.find('.window-select__options--dynamic');

    $('.window-select').not($select).removeClass('open'); // закрыть другие
    $select.toggleClass('open');

    // Подгрузка с API при первом открытии
    if ($dynamicBlock.length && !$dynamicBlock.data('loaded')) {
        const apiUrl = $dynamicBlock.data('api-url');
        const apiMethod = $dynamicBlock.data('api-method');
        const apiParams = $dynamicBlock.data('api-params');
        const displayFields = $dynamicBlock.data('display-fields') || [];

        $.ajax({
            url: apiUrl,
            method: apiMethod,
            data: apiParams,
            dataType: 'json',
            success: function (res) {
                if (res.status === 'ok' && Array.isArray(res.result)) {
                    let html = '';
                    res.result.forEach(item => {
                        let displayText = '';
                        if (displayFields.length) {
                            displayText = displayFields.map(f => item[f] ?? '').join(' ');
                        } else {
                            displayText = Object.values(item).join(' - ');
                        }
                        html += `<div class="window-select__option" data-value="${item.uuid}">${displayText}</div>`;
                    });
                    $dynamicBlock.html(html).show();
                    $dynamicBlock.data('loaded', true);
                } else {
                    $dynamicBlock.html(`<div class="window-select__error">${res.callback || 'Ошибка загрузки'}</div>`).show();
                }
            },
            error: function () {
                $dynamicBlock.html(`<div class="window-select__error">Ошибка соединения</div>`).show();
            }
        });
    }
});

// Выбор опции
$(document).on('click', '.window-select__option', function () {
    const text = $(this).text(); // текст выбранной опции
    const $select = $(this).closest('.window-select');

    $select.find('.window-select__placeholder').text(text);
    $select.removeClass('open');
    $select.find(`input[type="hidden"][name="${$select.data('name')}"]`).val(text);
});

// Кнопки в списке
$(document).on('click', '.window-select__buttons button', function (e) {
    e.stopPropagation();
    const action = $(this).data('action');
    $(document).trigger(`customSelectButton:${action}`, [this]);
});

$(document).on('input', '[data-window-numeric="true"]', function () {
    this.value = this.value.replace(/\D/g, '');
});

$(document).on('input', '[data-window-price-dollar="true"]', function () {
    let val = this.value.replace(/\D/g, '');
    if (val.length > 1 && val.startsWith('0')) {
        val = val.replace(/^0+/, '');
    }
    this.value = val ? val + '$' : '';
});