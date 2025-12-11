let currentR = 3;
let points = [];

const baseUrl = window.contextPath || '';
const pointForm = document.getElementById('pointForm');

// Функции для получения canvas и ctx динамически
function getCanvas() {
    return document.getElementById('graphCanvas');
}

function getCtx() {
    const canvas = getCanvas();
    return canvas ? canvas.getContext('2d') : null;
}

function drawAxes(ctx, width, height, centerX, centerY) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    ctx.fillStyle = '#333';

    ctx.beginPath();
    ctx.moveTo(width - 10, centerY - 5);
    ctx.lineTo(width, centerY);
    ctx.lineTo(width - 10, centerY + 5);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX - 5, 10);
    ctx.lineTo(centerX, 0);
    ctx.lineTo(centerX + 5, 10);
    ctx.fill();
}

function drawGraph(r) {
    const canvas = getCanvas();
    const ctx = getCtx();
    if (!canvas || !ctx) {
        console.warn('Canvas or context not available');
        return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 150 / (r || 3);

    console.log('Drawing graph with R:', r, 'Scale:', scale);
    console.log('Available points:', points);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    drawShapes(ctx, centerX, centerY, scale, r);
    drawGrid(ctx, width, height, centerX, centerY, scale, r);
    drawAxes(ctx, width, height, centerX, centerY);
    drawLabels(ctx, centerX, centerY, scale, r);

    // Фильтруем точки по текущему R
    const filteredPoints = points.filter(point => {
        // Используем небольшую погрешность для сравнения чисел с плавающей точкой
        return Math.abs(point.r - r) < 0.001;
    });

    console.log(`Filtered points for R=${r}:`, filteredPoints);

    drawPoints(ctx, centerX, centerY, scale, r, filteredPoints);
}


function drawShapes(ctx, centerX, centerY, scale, r) {
    ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
    ctx.lineWidth = 2;

    // Первая четверть (x >= 0, y >= 0): четверть круга радиусом R/2
    ctx.beginPath();
    ctx.arc(centerX, centerY, (r/2) * scale, 0, Math.PI / 2, false);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Вторая четверть (x <= 0, y >= 0): треугольник (0,0), (-R/2,0), (0,R/2)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY); // (0, 0)
    ctx.lineTo(centerX - (r/2) * scale, centerY); // (-R/2, 0)
    ctx.lineTo(centerX, centerY - (r/2) * scale); // (0, R/2)
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Третья четверть (x <= 0, y <= 0): прямоугольник R/2 x R
    ctx.beginPath();
    ctx.rect(centerX - (r/2) * scale, centerY, (r/2) * scale, r * scale);
    ctx.fill();
    ctx.stroke();

    // Четвертая четверть (x >= 0, y <= 0): ничего не рисуем
}

function drawGrid(ctx, width, height, centerX, centerY, scale, r) {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    // Убираем 1.5R, оставляем только -R, -R/2, 0, R/2, R
    const steps = [-r, -r/2, 0, r/2, r];

    steps.forEach(step => {
        if (step !== 0) { // Не рисуем центральную линию (она уже есть как ось)
            const x = centerX + step * scale;
            if (x > 0 && x < width) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            const y = centerY - step * scale;
            if (y > 0 && y < height) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
        }
    });
}

function drawLabels(ctx, centerX, centerY, scale, r) {
    const canvas = getCanvas();
    if (!canvas) return;

    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Убираем 1.5R, оставляем только -R, -R/2, R/2, R
    const xValues = [-r, -r/2, r/2, r];
    for (let value of xValues) {
        const x = centerX + value * scale;
        let label;
        if (value === -r) label = "-R";
        else if (value === -r/2) label = "-R/2";
        else if (value === r/2) label = "R/2";
        else if (value === r) label = "R";

        if (x > 20 && x < canvas.width - 20) {
            ctx.fillText(label, x, centerY + 15);

            // Маленькая отметка на оси
            ctx.beginPath();
            ctx.moveTo(x, centerY - 3);
            ctx.lineTo(x, centerY + 3);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // Аналогично для оси Y: убираем 1.5R
    const yValues = [r, r/2, -r/2, -r];
    for (let value of yValues) {
        const y = centerY - value * scale;
        let label;
        if (value === r) label = "R";
        else if (value === r/2) label = "R/2";
        else if (value === -r/2) label = "-R/2";
        else if (value === -r) label = "-R";

        if (y > 20 && y < canvas.height - 20) {
            ctx.fillText(label, centerX - 20, y);

            // Маленькая отметка на оси
            ctx.beginPath();
            ctx.moveTo(centerX - 3, y);
            ctx.lineTo(centerX + 3, y);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // Подписи осей
    ctx.fillText('X', canvas.width - 10, centerY - 10);
    ctx.fillText('Y', centerX + 15, 10);
}

function drawPoints(ctx, centerX, centerY, scale, r, pointsToDraw) {
    pointsToDraw.forEach(point => {
        const x = centerX + point.x * scale;
        const y = centerY - point.y * scale;

        // Проверяем, что точка в пределах канваса
        if (x >= 0 && x <= ctx.canvas.width && y >= 0 && y <= ctx.canvas.height) {
            ctx.fillStyle = point.hit ? '#28a745' : '#dc3545';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();

            console.log(`Drawn point: (${point.x}, ${point.y}), screen: (${x}, ${y}), hit: ${point.hit}`);
        }
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

    // Сохраняем точку с правильными данными
    addPointToGraph(parseFloat(rowData.x), parseFloat(rowData.y), rowData.hit, parseFloat(rowData.r));
}

function convertToMathX(canvasX, R) {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return 0;

    const centerX = canvas.width / 2;
    const scale = 150 / (R || 3);
    return (canvasX - centerX) / scale;
}

function convertToMathY(canvasY, R) {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return 0;

    const centerY = canvas.height / 2;
    const scale = 150 / (R || 3);
    return (centerY - canvasY) / scale;
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

function updateGraphAfterSubmit() {
    // Перезагружаем точки из таблицы
    loadPointsFromTable();

    // Перерисовываем график
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

// Функция для отображения ошибок валидации
function showValidationError(message) {
    // Можно добавить временное сообщение
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #dc3545;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        animation: fadeIn 0.3s;
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function hideValidationError() {
    // Удаляем все сообщения об ошибках
    const errors = document.querySelectorAll('.validation-error-message');
    errors.forEach(error => error.remove());
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

// Функция для инициализации обработчиков формы
function initFormHandlers() {
    // Обработчик изменения R (selectOneMenu) - используем делегирование
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id && e.target.id.includes('r') && e.target.tagName === 'SELECT') {
            const value = parseFloat(e.target.value);
            if (value && !isNaN(value)) {
                currentR = value;
                drawGraph(currentR);
            }
            // Очищаем ошибки при изменении R
            hideValidationError();
        }
    });

    // Обработчик изменения X (selectOneMenu) - используем делегирование
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id && e.target.id.includes('x') && e.target.tagName === 'SELECT') {
            // Очищаем ошибки при изменении X
            hideValidationError();
        }
    });

    // Обработчик изменения Y (inputText) - используем делегирование
    document.addEventListener('input', function(e) {
        if (e.target && (e.target.name === 'y' || (e.target.id && e.target.id.includes('y')))) {
            // Очищаем ошибки при изменении Y
            hideValidationError();
        }
    });
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

function initCanvasClickHandler() {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return;

    const rSelect = document.querySelector('[id*="r"]');
    if (rSelect && rSelect.value) {
        currentR = parseFloat(rSelect.value);
    }

    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Конвертируем координаты канваса в математические
        const mathX = convertToMathX(x, currentR);
        const mathY = convertToMathY(y, currentR);

        console.log(`Canvas click: screen (${x}, ${y}) -> math (${mathX.toFixed(2)}, ${mathY.toFixed(2)})`);

        // Проверяем, что Y в допустимом диапазоне
        if (mathY < -3 || mathY > 5) {
            showValidationError(`Y должен быть от -3 до 5. Получено: ${mathY.toFixed(2)}`);
            return;
        }

        // Округляем X до ближайшего допустимого значения
        const validX = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
        let roundedX = validX[0];
        let minDiff = Math.abs(mathX - roundedX);

        for (let i = 1; i < validX.length; i++) {
            const diff = Math.abs(mathX - validX[i]);
            if (diff < minDiff) {
                minDiff = diff;
                roundedX = validX[i];
            }
        }

        // Заполняем скрытые поля формы
        const graphXInput = document.querySelector('[id*="graphX"]');
        const graphYInput = document.querySelector('[id*="graphY"]');
        const rInput = document.querySelector('[id*="r"]');

        if (graphXInput) graphXInput.value = roundedX;
        if (graphYInput) graphYInput.value = mathY.toFixed(4);
        if (rInput && !rInput.value) {
            // Если R не выбран, устанавливаем текущий
            rInput.value = currentR;
        }

        // Отправляем форму через скрытую кнопку
        const graphSubmitBtn = document.querySelector('[id*="graphSubmitBtn"]');
        if (graphSubmitBtn) {
            // Активируем кнопку
            graphSubmitBtn.click();
        } else {
            console.error('Graph submit button not found');
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

function initCookieConsent() {
    const consent = getCookieConsent();

    if (!consent) {
        initCookieModal();
    } else {
        if (consent.analytics) {
            enableYandexMetrika();
        } else {
            disableYandexMetrika();
        }
        hideCookieModal();
    }
}

function initCookieModal() {
    document.body.classList.add('cookie-blocked');

    const modalOverlay = document.getElementById('cookie-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('visible');
    }
}

function hideCookieModal() {
    const modalOverlay = document.getElementById('cookie-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('visible');
        modalOverlay.style.display = 'none';
    }
    document.body.classList.remove('cookie-blocked');
}

function removeCookieModal() {
    const modalOverlay = document.getElementById('cookie-modal-overlay');
    if (modalOverlay && modalOverlay.parentNode) {
        modalOverlay.parentNode.removeChild(modalOverlay);
    }
    document.body.classList.remove('cookie-blocked');
}

function acceptAllCookiesModal() {
    setCookieConsent({
        necessary: true,
        analytics: true,
        timestamp: new Date().toISOString()
    });
    enableYandexMetrika();
    hideCookieModal();
    removeCookieModal();
    showAcceptanceMessage('Все cookies приняты! 🎉');
}

function acceptSelectedCookiesModal() {
    const analyticsChecked = document.getElementById('cookie-analytics-modal')?.checked || false;

    setCookieConsent({
        necessary: true,
        analytics: analyticsChecked,
        timestamp: new Date().toISOString()
    });

    if (analyticsChecked) {
        enableYandexMetrika();
        showAcceptanceMessage('Выбранные cookies приняты! ✅');
    } else {
        disableYandexMetrika();
        showAcceptanceMessage('Только обязательные cookies приняты! 🔒');
    }

    hideCookieModal();
    removeCookieModal();
}

function rejectAllCookiesModal() {
    setCookieConsent({
        necessary: true,
        analytics: false,
        timestamp: new Date().toISOString()
    });
    disableYandexMetrika();
    hideCookieModal();
    removeCookieModal();
    showAcceptanceMessage('Все необязательные cookies отклонены! 🛡️');
}

function showAcceptanceMessage(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function setCookieConsent(consent) {
    const consentString = JSON.stringify(consent);
    localStorage.setItem('cookieConsent', consentString);

    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    document.cookie = `cookieConsent=${encodeURIComponent(consentString)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
}

function getCookieConsent() {
    const localStorageConsent = localStorage.getItem('cookieConsent');
    if (localStorageConsent) {
        try {
            return JSON.parse(localStorageConsent);
        } catch (e) {
            console.error('Error parsing cookie consent from localStorage:', e);
        }
    }

    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('cookieConsent='))
        ?.split('=')[1];

    if (cookieValue) {
        try {
            return JSON.parse(decodeURIComponent(cookieValue));
        } catch (e) {
            console.error('Error parsing cookie consent from cookie:', e);
        }
    }

    return null;
}

function enableYandexMetrika() {
    if (window.ym) {
        ym(104390254, 'params', {
            cookie_consent: 'accepted'
        });
    }
}

function disableYandexMetrika() {
    if (window.ym) {
        ym(104390254, 'params', {
            cookie_consent: 'rejected'
        });
    }
}

function initChatWidget() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.getElementById('chat-container');
    const closeChat = document.getElementById('close-chat');
    const sendMessageBtn = document.getElementById('send-message');
    const chatInput = document.getElementById('chat-input');
    const notificationSound = document.getElementById('notification-sound');

    if (!chatToggle || !chatContainer) return;

    setTimeout(() => {
        if (!localStorage.getItem('chatAutoOpened')) {
            openChat();
            playNotificationSound();
            localStorage.setItem('chatAutoOpened', 'true');
        }
    }, 10000);

    chatToggle.addEventListener('click', openChat);

    closeChat.addEventListener('click', closeChatFunc);

    sendMessageBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function openChat() {
        chatContainer.classList.remove('chat-closed');
        chatContainer.classList.add('chat-open');
        chatToggle.classList.remove('chat-toggle-closed');
        chatToggle.classList.add('chat-toggle-open');
        chatInput.focus();
    }

    function closeChatFunc() {
        chatContainer.classList.remove('chat-open');
        chatContainer.classList.add('chat-closed');
        chatToggle.classList.remove('chat-toggle-open');
        chatToggle.classList.add('chat-toggle-closed');
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessageToChat(message, 'user');
            chatInput.value = '';

            setTimeout(() => {
                const responses = [
                    "Допустим. Чем еще могу помочь?",
                    "Хорошо! Если возникнут вопросы по работе с графиком - обращайтесь!",
                    "Я здесь, чтобы помочь вам разобраться с функционалом графика."
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessageToChat(randomResponse, 'consultant');
                playNotificationSound();
            }, 1000 + Math.random() * 2000);
        }
    }

    function addMessageToChat(text, sender) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="${baseUrl}${sender === 'consultant' ? '/images/consultant.jpg' : '/images/user-avatar.jpg'}" alt="${sender === 'consultant' ? 'Консультант' : 'Пользователь'}">
            </div>
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${timeString}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function playNotificationSound() {
        if (notificationSound) {
            notificationSound.currentTime = 0;
            notificationSound.play().catch(e => {
                console.log('Не удалось воспроизвести звук уведомления:', e);
            });
        }
    }
}

function createFloatingConsultants() {
    const container = document.getElementById('floating-consultants');
    if (!container) return;

    const consultantCount = 15;

    for (let i = 0; i < consultantCount; i++) {
        const consultant = document.createElement('div');
        consultant.className = 'floating-consultant';

        const sizes = ['small', 'medium', 'large', 'xlarge'];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        consultant.classList.add(randomSize);

        const animationTypes = ['', 'reverse', 'alternate', 'complex', 'pulse'];
        const randomAnimation = animationTypes[Math.floor(Math.random() * animationTypes.length)];
        if (randomAnimation) {
            consultant.classList.add(randomAnimation);
        }

        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        consultant.style.left = `${startX}%`;
        consultant.style.top = `${startY}%`;

        consultant.style.animationDelay = `${Math.random() * 5}s`;

        const img = document.createElement('img');
        img.src = `${baseUrl}/images/consultant.jpg`;
        img.alt = 'Консультант';
        img.onerror = function() {
            this.style.display = 'none';
            consultant.style.background = `linear-gradient(135deg, 
                hsl(${Math.random() * 360}, 70%, 60%), 
                hsl(${Math.random() * 360}, 70%, 40%))`;
            consultant.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        };

        consultant.appendChild(img);
        container.appendChild(consultant);
    }
}

function loadPointsFromTable() {
    const table = document.getElementById('resultsTable:resultsTable_data'); // Обратите внимание на ID!
    if (!table) {
        console.log('Results table not found');
        return;
    }

    points = [];

    // Ищем строки с результатами (PrimeFaces добавляет свои классы)
    const rows = table.querySelectorAll('tr');
    console.log(`Found ${rows.length} rows in table`);

    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) { // 5 колонок: X, Y, R, Результат, Время
            try {
                const xText = cells[0].textContent.trim();
                const yText = cells[1].textContent.trim();
                const rText = cells[2].textContent.trim();
                const hitText = cells[3].textContent.trim();

                const x = parseFloat(xText);
                const y = parseFloat(yText.replace(',', '.'));
                const r = parseFloat(rText.replace(',', '.'));

                const hit = hitText.includes('Попадание') || hitText.toLowerCase().includes('hit');

                if (!isNaN(x) && !isNaN(y) && !isNaN(r)) {
                    points.push({ x, y, r, hit });
                    console.log(`Loaded point ${index}: (${x}, ${y}), R=${r}, hit=${hit}`);
                } else {
                    console.warn(`Invalid point at row ${index}: x=${xText}, y=${yText}, r=${rText}`);
                }
            } catch (e) {
                console.error(`Error parsing row ${index}:`, e);
            }
        }
    });

    console.log(`Total points loaded: ${points.length}`);
}

function observeTableChanges() {
    const table = document.getElementById('resultsTable');
    if (!table) return;

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                console.log('Table changed, reloading points');
                loadPointsFromTable();
                drawGraph(currentR);
            }
        });
    });

    observer.observe(table, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing graph...');

    // Загружаем начальные точки из таблицы
    loadPointsFromTable();

    // Рисуем график
    drawGraph(currentR);

    // Начинаем наблюдать за изменениями таблицы
    observeTableChanges();

    // Инициализируем обработчики
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