let currentR = 3;
let points = [];

const baseUrl = window.contextPath || '';
const pointForm = document.getElementById('pointForm');

// --- ФУНКЦИИ ОТРИСОВКИ (Оставлены без изменений, сокращено для удобства) ---
function getCanvas() { return document.getElementById('graphCanvas'); }
function getCtx() { const c = getCanvas(); return c ? c.getContext('2d') : null; }

function drawGraph(r) {
    const canvas = getCanvas();
    const ctx = getCtx();
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 150 / (r || 3);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    drawShapes(ctx, centerX, centerY, scale, r);
    drawGrid(ctx, width, height, centerX, centerY, scale, r);
    drawAxes(ctx, width, height, centerX, centerY);
    drawLabels(ctx, centerX, centerY, scale, r);

    // Рисуем все точки, которые подходят под текущий R (или все, если хотите видеть историю)
    // Здесь фильтруем по R, чтобы видеть только точки для текущего радиуса
    const filteredPoints = points.filter(point => Math.abs(point.r - r) < 0.001);
    drawPoints(ctx, centerX, centerY, scale, r, filteredPoints);
}

function drawShapes(ctx, centerX, centerY, scale, r) {
    ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
    ctx.lineWidth = 2;

    // 1 четверть: четверть круга
    ctx.beginPath();
    ctx.arc(centerX, centerY, (r/2) * scale, 1.5 * Math.PI, Math.PI * 2, false);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // 2 четверть: треугольник
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - (r/2) * scale, centerY);
    ctx.lineTo(centerX, centerY - (r/2) * scale); // Исправлено направление Y для Canvas
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // 3 четверть: прямоугольник
    ctx.beginPath();
    ctx.rect(centerX - (r/2) * scale, centerY, (r/2) * scale, r * scale);
    ctx.fill(); ctx.stroke();
}

function drawGrid(ctx, width, height, centerX, centerY, scale, r) {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    const steps = [-r, -r/2, 0, r/2, r];
    steps.forEach(step => {
        if (step !== 0) {
            const x = centerX + step * scale;
            if (x > 0 && x < width) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
            const y = centerY - step * scale;
            if (y > 0 && y < height) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
        }
    });
}

function drawAxes(ctx, width, height, centerX, centerY) {
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(width, centerY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height); ctx.stroke();
}

function drawLabels(ctx, centerX, centerY, scale, r) {
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Подписи осей
    ctx.fillText('X', ctx.canvas.width - 10, centerY - 15);
    ctx.fillText('Y', centerX + 15, 10);

    // Рисуем метки для оси X
    // R
    ctx.fillText('R', centerX + r * scale, centerY + 15);
    ctx.beginPath(); ctx.moveTo(centerX + r * scale, centerY - 3); ctx.lineTo(centerX + r * scale, centerY + 3); ctx.stroke();

    // R/2
    ctx.fillText('R/2', centerX + (r / 2) * scale, centerY + 15);
    ctx.beginPath(); ctx.moveTo(centerX + (r/2) * scale, centerY - 3); ctx.lineTo(centerX + (r/2) * scale, centerY + 3); ctx.stroke();

    // -R
    ctx.fillText('-R', centerX - r * scale, centerY + 15);
    ctx.beginPath(); ctx.moveTo(centerX - r * scale, centerY - 3); ctx.lineTo(centerX - r * scale, centerY + 3); ctx.stroke();

    // -R/2
    ctx.fillText('-R/2', centerX - (r / 2) * scale, centerY + 15);
    ctx.beginPath(); ctx.moveTo(centerX - (r/2) * scale, centerY - 3); ctx.lineTo(centerX - (r/2) * scale, centerY + 3); ctx.stroke();

    // Рисуем метки для оси Y (сдвигаем текст немного влево от оси)
    // R
    ctx.fillText('R', centerX - 15, centerY - r * scale);
    ctx.beginPath(); ctx.moveTo(centerX - 3, centerY - r * scale); ctx.lineTo(centerX + 3, centerY - r * scale); ctx.stroke();

    // R/2
    ctx.fillText('R/2', centerX - 20, centerY - (r / 2) * scale);
    ctx.beginPath(); ctx.moveTo(centerX - 3, centerY - (r/2) * scale); ctx.lineTo(centerX + 3, centerY - (r/2) * scale); ctx.stroke();

    // -R
    ctx.fillText('-R', centerX - 15, centerY + r * scale);
    ctx.beginPath(); ctx.moveTo(centerX - 3, centerY + r * scale); ctx.lineTo(centerX + 3, centerY + r * scale); ctx.stroke();

    // -R/2
    ctx.fillText('-R/2', centerX - 20, centerY + (r / 2) * scale);
    ctx.beginPath(); ctx.moveTo(centerX - 3, centerY + (r/2) * scale); ctx.lineTo(centerX + 3, centerY + (r/2) * scale); ctx.stroke();
}

function drawPoints(ctx, centerX, centerY, scale, r, pointsToDraw) {
    pointsToDraw.forEach(point => {
        const x = centerX + point.x * scale;
        const y = centerY - point.y * scale;
        if (x >= 0 && x <= ctx.canvas.width && y >= 0 && y <= ctx.canvas.height) {
            ctx.fillStyle = point.hit ? '#28a745' : '#dc3545';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.stroke();
        }
    });
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

function convertToMathX(canvasX, R) {
    const canvas = getCanvas();
    const centerX = canvas.width / 2;
    const scale = 150 / (R || 3);
    return (canvasX - centerX) / scale;
}

function convertToMathY(canvasY, R) {
    const canvas = getCanvas();
    const centerY = canvas.height / 2;
    const scale = 150 / (R || 3);
    return (centerY - canvasY) / scale;
}

// --- ЛОГИКА ОБНОВЛЕНИЯ ПОСЛЕ AJAX ---

function handleFormComplete(xhr, status, args) {
    if (args && !args.validationFailed) {
        // Успех
        updateGraphAfterSubmit();
        hideValidationError();
        showSuccessMessage("Точка успешно проверена!");
    } else {
        // Ошибка валидации на сервере (если есть)
        showValidationError("Ошибка проверки данных на сервере");
    }
}

function updateGraphAfterSubmit() {
    // PrimeFaces обновляет DOM таблицы асинхронно.
    // Иногда oncomplete срабатывает чуть раньше, чем браузер отрисует новую строку.
    // Делаем небольшую задержку, чтобы DOM точно обновился.
    setTimeout(() => {
        loadPointsFromTable();
        drawGraph(currentR);
    }, 100);
}

function loadPointsFromTable() {
    // Получаем тело таблицы PrimeFaces
    const tableBody = document.querySelector('#resultsTable_data');
    if (!tableBody) return;

    points = []; // Очищаем старые точки перед полным сканированием таблицы
    const rows = tableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        // Проверяем, что это не строка "Нет записей" (PrimeFaces empty message)
        if (cells.length >= 4 && row.getAttribute('data-ri') !== null) {
            try {
                // Парсим значения, заменяя запятые на точки
                const x = parseFloat(cells[0].innerText.trim().replace(',', '.'));
                const y = parseFloat(cells[1].innerText.trim().replace(',', '.'));
                const r = parseFloat(cells[2].innerText.trim().replace(',', '.'));

                // Определяем попадание по классу или тексту
                const hitText = cells[3].innerText.trim();
                const hitSpan = cells[3].querySelector('span'); // Если внутри есть span с классом
                let hit = false;

                if (hitSpan && hitSpan.classList.contains('hit')) hit = true;
                else if (cells[3].classList.contains('hit')) hit = true;
                else hit = hitText.toLowerCase().includes('попадание') || hitText.toLowerCase().includes('hit');

                if (!isNaN(x) && !isNaN(y) && !isNaN(r)) {
                    points.push({ x, y, r, hit });
                }
            } catch (e) {
                console.error("Ошибка парсинга строки таблицы:", e);
            }
        }
    });
    console.log(`Загружено ${points.length} точек из таблицы.`);
}

// --- УВЕДОМЛЕНИЯ ---

function showSuccessMessage(message) {
    createNotification(message, '#28a745'); // Зеленый
}

// Новая функция ошибки в стиле успеха
function showValidationError(message) {
    createNotification(message, '#dc3545'); // Красный
}

function createNotification(message, bgColor) {
    // Удаляем старые уведомления, чтобы не накладывались
    const old = document.querySelector('.custom-notification');
    if (old) old.remove();

    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        font-family: Arial, sans-serif;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if(notification.parentNode) document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function hideValidationError() {
    // Функция-заглушка, так как новые уведомления сами исчезают,
    // но можно использовать для принудительного удаления
    const notification = document.querySelector('.custom-notification');
    if (notification && notification.style.background.includes('220')) { // Если красный
        notification.remove();
    }
}

// --- ИНИЦИАЛИЗАЦИЯ И СОБЫТИЯ ---

window.addEventListener("load", function () {
    // Инициализация R
    const rSelect = document.querySelector('[id*="r_input"]') || document.querySelector('[id*="r"] select') || document.querySelector('[id*="r"]');
    // PrimeFaces часто скрывает настоящий select и делает свой UI.
    // Пробуем найти значение в скрытом input PrimeFaces или в самом select

    // Ищем R более надежно для PrimeFaces
    updateCurrentR();

    loadPointsFromTable();
    drawGraph(currentR);
    initCanvasClickHandler();
    initFormHandlers();
});

function updateCurrentR() {
    // Попытка найти значение R из виджета PrimeFaces или select
    const rElement = document.getElementById('pointForm:r_input'); // Стандартный ID PrimeFaces для скрытого инпута
    if (rElement) {
        currentR = parseFloat(rElement.value);
    } else {
        // Fallback если не PrimeFaces
        const rSelect = document.querySelector("select[id*='r']");
        if(rSelect && rSelect.value) currentR = parseFloat(rSelect.value);
    }
    if (isNaN(currentR)) currentR = 3; // Дефолт
}

function initFormHandlers() {
    // Слушаем изменение R в PrimeFaces
    // PrimeFaces создает div с классами ui-selectonemenu. Лучше использовать onchange в xhtml,
    // но если через JS:
    const rSelect = document.querySelector('[id*="r"]');
    if (rSelect) {
        // Наблюдаем за изменениями, так как PrimeFaces меняет скрытый input
        const observer = new MutationObserver(() => {
            updateCurrentR();
            drawGraph(currentR);
        });
        observer.observe(rSelect, { attributes: true, subtree: true, childList: true });
    }

    const form = document.getElementById('pointForm');
    if(form) {
        // Перехватываем стандартную кнопку, чтобы добавить валидацию
        const submitBtn = document.querySelector('.submit-btn');
        // Примечание: p:commandButton работает через AJAX onclick,
        // поэтому addEventListener('submit') на форму может не сработать как ожидается.
        // Лучше использовать onclick на кнопку или встроенную валидацию JSF.

        // Но для JS-валидации "перед отправкой" (чтобы показать тосты):
        if(submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                let errors = [];

                // Валидация X
                const xInput = document.getElementById('pointForm:x_input'); // PrimeFaces
                if (!xInput || !xInput.value) errors.push("Выберите X");

                // Валидация Y
                const yInput = document.getElementById('pointForm:y');
                if (!yInput || !yInput.value) {
                    errors.push("Введите Y");
                } else {
                    const y = parseFloat(yInput.value);
                    if (y < -3 || y > 5) errors.push("Y от -3 до 5");
                }

                // Валидация R
                const rInput = document.getElementById('pointForm:r_input');
                if (!rInput || !rInput.value) errors.push("Выберите R");

                if (errors.length > 0) {
                    // Если есть ошибки, показываем тост и, возможно, пытаемся остановить запрос
                    // (с PrimeFaces остановить сложнее, если не использовать onstart)
                    showValidationError(errors.join(", "));
                    // e.preventDefault(); // Это может не остановить PrimeFaces AJAX, но попробуем
                }
            });
        }
    }
}

function initCanvasClickHandler() {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas.addEventListener('click', function(event) {
        updateCurrentR(); // Убедимся, что R свежий

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const mathX = convertToMathX(x, currentR);
        const mathY = convertToMathY(y, currentR);

        // Заполняем скрытые поля
        document.getElementById('pointForm:graphX').value = mathX.toFixed(4);
        document.getElementById('pointForm:graphY').value = mathY.toFixed(4);

        // Жмем скрытую кнопку
        const btn = document.getElementById('pointForm:graphSubmitBtn');
        if (btn) btn.click();
    });
}

function addPointToGraph(x, y, hit, r) {
    // Сохраняем R вместе с точкой для правильной фильтрации
    points.push({ x, y, hit, r: r || currentR });
    drawGraph(currentR);
}

function addRow(rowData) {
    const table = document.getElementById("resultsTable");
    if (!table) {
        return;
    }
    const newRow = table.insertRow(0);
    newRow.innerHTML = `
        <td>${rowData.x}</td>
        <td>${rowData.y.toFixed(2)}</td>
        <td>${rowData.r}</td>
        <td class="${rowData.hit ? "hit" : "miss"}">${rowData.hit ? "Попадание" : "Промах"}</td>
        <td>${rowData.currentTime}</td>
        <td class="execution-time">${rowData.executionTime}</td>
    `;

    // Немедленно добавляем точку на график
    addPointToGraph(parseFloat(rowData.x), parseFloat(rowData.y), rowData.hit, parseFloat(rowData.r));
}

function loadResultsFromServer() {
    const formData = new FormData();
    formData.append('action', 'getHistory');

    fetch(`${baseUrl}/controller`, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
        }
    })
        .then(response => {
            console.log('Load history response status:', response.status);
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return response.text().then(text => {
                    console.warn('Non-JSON response for history:', text.substring(0, 200));
                    throw new Error('Server returned non-JSON response');
                });
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                points = [];
                const table = document.getElementById("resultsTable");
                if (table) {
                    const headerRow = table.rows[0];
                    table.innerHTML = '';
                    if (headerRow) table.appendChild(headerRow);

                    data.results.forEach(rowData => {
                        addRow(rowData);
                    });
                } else {
                    console.debug('resultsTable element not found, skipping table rendering');
                }

                const resultsCount = document.getElementById('results-count');
                if (resultsCount) {
                    resultsCount.textContent = `Всего результатов: ${data.totalCount || data.results.length}`;
                }

                console.log(`Загружено ${data.results.length} результатов из глобальной истории`);

                const loadingRow = document.getElementById('loading-row');
                if (loadingRow) {
                    loadingRow.remove();
                }
            } else {
                console.error('Server error:', data.error);
            }
        })
        .catch(error => {
            console.error('Error loading history:', error);
            const resultsCount = document.getElementById('results-count');
            if (resultsCount) {
                resultsCount.textContent = 'Ошибка загрузки истории: ' + error.message;
            }
        });
}

function clearHistoryOnServer() {
    const button = document.getElementById('clear-history-btn');
    if (!button) {
        return;
    }

    const originalContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span class="btn-icon">⏳</span> Очистка...';

    const formData = new FormData();
    formData.append('action', 'clearHistory');

    fetch(`${baseUrl}/controller`, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
        }
    })
        .then(response => {
            console.log('Clear history response status:', response.status);
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return response.text().then(text => {
                    console.warn('Non-JSON response for clearHistory:', text.substring(0, 200));
                    throw new Error('Server returned non-JSON response');
                });
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                points = [];
                const table = document.getElementById("resultsTable");
                if (table) {
                    table.innerHTML = '';
                }

                const resultsCount = document.getElementById('results-count');
                if (resultsCount) {
                    resultsCount.textContent = data.message || 'История очищена';
                }

                drawGraph(currentR);
            } else {
                throw new Error(data.error || 'Не удалось очистить историю');
            }
        })
        .catch(error => {
            console.error('Error clearing history:', error);
            showServerError(`Ошибка очистки истории: ${error.message}`);
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = originalContent;
        });
}

function updatePointsFromTable() {
    const table = document.getElementById('resultsTable_data'); // ID таблицы PrimeFaces
    if (!table) {
        console.log('Table not found, waiting...');
        setTimeout(updatePointsFromTable, 500);
        return;
    }

    points = [];
    const rows = table.querySelectorAll('tr'); // PrimeFaces строки

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
            try {
                // ВАЖНО: Заменяем запятую на точку перед парсингом!
                const xText = cells[0].textContent.trim().replace(',', '.');
                const yText = cells[1].textContent.trim().replace(',', '.');
                const rText = cells[2].textContent.trim().replace(',', '.');

                const x = parseFloat(xText);
                const y = parseFloat(yText);
                const r = parseFloat(rText);
                const hitText = cells[3].textContent.trim();
                const hit = hitText.includes('Попадание') || hitText.toLowerCase().includes('hit'); // Добавил проверку на разные варианты

                if (!isNaN(x) && !isNaN(y) && !isNaN(r)) {
                    points.push({ x, y, r, hit });
                }
            } catch (e) {
                console.error('Error parsing row:', e);
            }
        }
    });

    console.log('Points updated from table:', points);
    drawGraph(currentR);
}

window.addEventListener("load", function () {
    console.log('Page loaded, initializing graph and loading global history...');

    loadResultsFromServer();

    const clearHistoryButton = document.getElementById('clear-history-btn');
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', clearHistoryOnServer);
    }

    drawGraph(currentR);

    // Загружаем точки из таблицы
    setTimeout(updateGraphAfterSubmit, 500);

    // Инициализация обработчиков формы
    initFormHandlers();

    // Инициализация обработчика клика на canvas
    initCanvasClickHandler();

    // Установка начального значения R и отрисовка графика
    const defaultR = document.querySelector('select[id*="r"]');
    if (defaultR && defaultR.value) {
        currentR = parseFloat(defaultR.value);
    }
    if (currentR) {
        drawGraph(currentR);
    } else {
        // Если R не выбран, рисуем график с дефолтным значением для визуализации
        drawGraph(3);
    }

    // Перерисовка графика при изменении R через select
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id && e.target.id.includes('r')) {
            const rValue = parseFloat(e.target.value);
            if (!isNaN(rValue)) {
                currentR = rValue;
                drawGraph(currentR);
            }
        }
    });
});

function showServerError(message) {
    const serverErrorElement = document.getElementById('server-error');
    if (!serverErrorElement) {
        return;
    }

    serverErrorElement.textContent = message;
    serverErrorElement.classList.add('visible');

    if (serverErrorElement._hideTimeout) {
        clearTimeout(serverErrorElement._hideTimeout);
    }

    serverErrorElement._hideTimeout = setTimeout(() => {
        hideServerError();
    }, 5000);
}

function hideServerError() {
    const serverErrorElement = document.getElementById('server-error');
    if (!serverErrorElement) return;

    serverErrorElement.classList.remove('visible');
    serverErrorElement.textContent = '';

    if (serverErrorElement._hideTimeout) {
        clearTimeout(serverErrorElement._hideTimeout);
        serverErrorElement._hideTimeout = null;
    }
}

if (pointForm) {
    pointForm.addEventListener("submit", function (event) {
        let valid = true;
        const errors = [];

        // Очищаем предыдущие ошибки
        hideValidationError();

        // Валидация полей X (selectOneMenu)
        const xSelect = pointForm.querySelector('select[id*="x"]');
        if (!xSelect || !xSelect.value || xSelect.value === '') {
            const xError = pointForm.querySelector('[id*="x"]')?.closest('.form-section')?.querySelector('.error-message');
            if (xError) {
                xError.textContent = "Выберите значение X.";
            }
            errors.push("Выберите значение X.");
            valid = false;
        }

        const yInput = document.querySelector("input[name='y'], input[id*='y']");
        const yValue = yInput ? yInput.value.trim() : '';
        if (!yValue) {
            const yError = document.getElementById("y-error");
            if (yError) {
                yError.textContent = "Введите значение Y.";
            }
            errors.push("Введите значение Y.");
            valid = false;
        } else {
            const y = parseFloat(yValue);
            if (isNaN(y) || y < -3 || y > 5) {
                const yError = document.getElementById("y-error");
                if (yError) {
                    yError.textContent = "Введите число от -3 до 5.";
                }
                errors.push("Y должен быть числом от -3 до 5.");
                valid = false;
            }
        }

        const rSelect = pointForm.querySelector('select[id*="r"]');
        if (!rSelect || !rSelect.value || rSelect.value === '') {
            const rError = document.querySelector('[id*="r"]')?.closest('.form-section')?.querySelector('.error-message');
            if (rError) {
                rError.textContent = "Выберите значение R.";
            }
            errors.push("Выберите значение R.");
            valid = false;
        }

        if (!valid) {
            // Показываем все ошибки под кнопкой
            showValidationError(errors.join(' '));
            event.preventDefault();
            return false;
        }

        // Если валидация прошла успешно, скрываем ошибки
        hideValidationError();
        // Форма отправится обычным way
        // и пользователь будет перенаправлен на страницу результата
    });
}

// Функция для обновления графика при изменении R (вызывается из PrimeFaces AJAX)
function updateGraphFromR() {
    const rSelect = document.querySelector('[id*="r"]');
    if (rSelect && rSelect.value) {
        currentR = parseFloat(rSelect.value);
        drawGraph(currentR);
    }
}

let lastValidY = '';

const yField = document.querySelector('input[name="y"]');
if (yField) {
    yField.addEventListener('input', function (e) {
        const value = e.target.value;
        const errorElement = document.getElementById('y-error');
        const regex = /^-?\d*(\.\d*)?$/;
        if (regex.test(value)) {
            lastValidY = value;
            if (errorElement) {
                errorElement.textContent = '';
            }
            // Очищаем ошибки валидации при корректном вводе
            hideValidationError();
        } else {
            if (errorElement) {
                errorElement.textContent = 'Только числа разрешены';
            }
            e.target.value = lastValidY;
        }
    });
}

function submitPointFromGraph(x, y, r) {
    if (!pointForm) return;

    // Обновляем значения в форме
    const xSelect = document.querySelector('[id*="x"]');
    const yInput = document.querySelector('[id*="y"]');
    const rSelect = document.querySelector('[id*="r"]');

    if (xSelect) xSelect.value = x;
    if (yInput) yInput.value = y;
    if (rSelect) rSelect.value = r;

    // Ищем и вызываем команду PrimeFaces
    const submitButton = document.querySelector('[id*="checkPoint"]');
    if (submitButton && typeof PrimeFaces !== 'undefined') {
        // Используем PrimeFaces AJAX
        PrimeFaces.ajax.AjaxRequest({
            source: submitButton,
            process: submitButton.id,
            update: 'resultsTable',
            oncomplete: function() {
                updateGraphAfterSubmit();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');

    // Загружаем начальные точки
    updatePointsFromTable();

    // Наблюдаем за изменениями в таблице
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                console.log('Table updated, refreshing points');
                setTimeout(updatePointsFromTable, 100);
            }
        });
    });

    const table = document.getElementById('resultsTable_data');
    if (table) {
        observer.observe(table, { childList: true, subtree: true });
    }

    // Инициализация обработчиков
    initFormHandlers();
    initCanvasClickHandler();

    // Следим за изменениями R
    const rSelect = document.querySelector('[id*="r"]');
    if (rSelect) {
        rSelect.addEventListener('change', function() {
            const value = parseFloat(this.value);
            if (!isNaN(value)) {
                currentR = value;
                drawGraph(currentR);
            }
        });
    }
});