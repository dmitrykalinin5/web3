let currentR = 3;
let points = [];
let PF = window.PF || {};

const baseUrl = window.contextPath || '';
const pointForm = document.getElementById('pointForm');

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

    const filteredPoints = points.filter(point => Math.abs(point.r - r) < 0.001);
    drawPoints(ctx, centerX, centerY, scale, r, filteredPoints);
}

function drawShapes(ctx, centerX, centerY, scale, r) {
    ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, (r/2) * scale, 1.5 * Math.PI, Math.PI * 2, false);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - (r/2) * scale, centerY);
    ctx.lineTo(centerX, centerY - (r/2) * scale);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

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

    ctx.fillText('X', ctx.canvas.width - 10, centerY - 15);
    ctx.fillText('Y', centerX + 15, 10);

    ctx.fillText('R', centerX + r * scale, centerY + 15);
    ctx.beginPath(); ctx.moveTo(centerX + r * scale, centerY - 3); ctx.lineTo(centerX + r * scale, centerY + 3); ctx.stroke();

    ctx.fillText('R/2', centerX + (r / 2) * scale, centerY + 15);
    ctx.beginPath(); ctx.moveTo(centerX + (r/2) * scale, centerY - 3); ctx.lineTo(centerX + (r/2) * scale, centerY + 3); ctx.stroke();

    ctx.fillText('-R', centerX - r * scale, centerY + 15);
    ctx.beginPath(); ctx.moveTo(centerX - r * scale, centerY - 3); ctx.lineTo(centerX - r * scale, centerY + 3); ctx.stroke();

    ctx.fillText('-R/2', centerX - (r / 2) * scale, centerY + 15);
    ctx.beginPath(); ctx.moveTo(centerX - (r/2) * scale, centerY - 3); ctx.lineTo(centerX - (r/2) * scale, centerY + 3); ctx.stroke();

    ctx.fillText('R', centerX - 15, centerY - r * scale);
    ctx.beginPath(); ctx.moveTo(centerX - 3, centerY - r * scale); ctx.lineTo(centerX + 3, centerY - r * scale); ctx.stroke();

    ctx.fillText('R/2', centerX - 20, centerY - (r / 2) * scale);
    ctx.beginPath(); ctx.moveTo(centerX - 3, centerY - (r/2) * scale); ctx.lineTo(centerX + 3, centerY - (r/2) * scale); ctx.stroke();

    ctx.fillText('-R', centerX - 15, centerY + r * scale);
    ctx.beginPath(); ctx.moveTo(centerX - 3, centerY + r * scale); ctx.lineTo(centerX + 3, centerY + r * scale); ctx.stroke();

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

function handleFormComplete(xhr, status, args) {
    if (args && !args.validationFailed) {
        updateGraphAfterSubmit();
        hideValidationError();
        showSuccessMessage("Точка успешно проверена!");
    } else {
        showValidationError("Ошибка проверки данных на сервере");
    }
}

function updateGraphAfterSubmit() {
    setTimeout(() => {
        loadPointsFromTable();
        drawGraph(currentR);
    }, 100);
}

function loadPointsFromTable() {
    const tableBody = document.querySelector('#resultsTable_data');
    if (!tableBody) return;

    points = [];
    const rows = tableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4 && row.getAttribute('data-ri') !== null) {
            try {
                const x = parseFloat(cells[0].innerText.trim().replace(',', '.'));
                const y = parseFloat(cells[1].innerText.trim().replace(',', '.'));
                const r = parseFloat(cells[2].innerText.trim().replace(',', '.'));

                const hitText = cells[3].innerText.trim();
                const hitSpan = cells[3].querySelector('span');
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

function showSuccessMessage(message) {
    createNotification(message, '#28a745');
}

function showValidationError(message) {
    createNotification(message, '#dc3545');
}

function createNotification(message, bgColor) {
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
    const notification = document.querySelector('.custom-notification');
    if (notification && notification.style.background.includes('220')) {
        notification.remove();
    }
}

window.addEventListener("load", function () {
    const rSelect = document.querySelector('[id*="r_input"]') || document.querySelector('[id*="r"] select') || document.querySelector('[id*="r"]');

    updateCurrentR();

    loadPointsFromTable();
    drawGraph(currentR);
    initCanvasClickHandler();
    initFormHandlers();
});

function updateCurrentR() {
    const rElement = document.getElementById('pointForm:r_input');
    if (rElement) {
        currentR = parseFloat(rElement.value);
    } else {
        const rSelect = document.querySelector("select[id*='r']");
        if(rSelect && rSelect.value) currentR = parseFloat(rSelect.value);
    }
    if (isNaN(currentR)) currentR = 3;
}

function initFormHandlers() {
    const rSelect = document.querySelector('[id*="r"]');
    if (rSelect) {
        rSelect.addEventListener('change', function() {
            if (window.PF && PF('xSlider')) {
                PF('xSlider').setValue(0);
                const xInput = document.getElementById('pointForm:x');
                if (xInput) {
                    xInput.value = 0;
                }
            }
            updateCurrentR();
            drawGraph(currentR);
        });
    }

    const form = document.getElementById('pointForm');
    if(form) {
        const submitBtn = document.querySelector('.submit-btn');

        if(submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                let errors = [];

                const xInput = document.getElementById('pointForm:x_input');
                if (!xInput || !xInput.value) errors.push("Выберите X");

                const yInput = document.getElementById('pointForm:y');
                if (!yInput || !yInput.value) {
                    errors.push("Введите Y");
                } else {
                    const y = parseFloat(yInput.value);
                    if (y < -3 || y > 5) errors.push("Y от -3 до 5");
                }

                const rInput = document.getElementById('pointForm:r_input');
                if (!rInput || !rInput.value) errors.push("Выберите R");

                if (errors.length > 0) {
                    showValidationError(errors.join(", "));
                }
            });
        }
    }

    const xSlider = document.querySelector('[id*="x_slider"]');
    if (xSlider) {
        xSlider.addEventListener('input', function(event) {
            const value = parseFloat(event.target.value);

            const xInput = document.getElementById('pointForm:x');
            if (xInput) {
                xInput.value = value;
                const changeEvent = new Event('change', { bubbles: true });
                xInput.dispatchEvent(changeEvent);
            }

            const valueDisplay = document.getElementById('pointForm:xOutput');
            if (valueDisplay) {
                valueDisplay.textContent = 'X = ' + value;
                valueDisplay.classList.add('pulsing');
                setTimeout(() => {
                    valueDisplay.classList.remove('pulsing');
                }, 300);
            }
        });
    }
}

function enhanceSliderInteraction() {
    const slider = document.querySelector('.ui-slider');
    const valueDisplay = document.getElementById('pointForm:xOutput');

    if (slider) {
        slider.addEventListener('input', function(e) {
            if (valueDisplay) {
                valueDisplay.style.transition = 'transform 0.1s ease';
                valueDisplay.style.transform = 'scale(1.1)';

                setTimeout(() => {
                    valueDisplay.style.transform = 'scale(1)';
                }, 100);
            }
        });
    }
}

function initCanvasClickHandler() {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas.addEventListener('click', function(event) {
        updateCurrentR();

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const mathX = convertToMathX(x, currentR);
        const mathY = convertToMathY(y, currentR);

        if (window.PF && PF('xSlider')) {
            PF('xSlider').setValue(mathX.toFixed(1));

            const xInput = document.getElementById('pointForm:x');
            if (xInput) {
                xInput.value = mathX.toFixed(1);
            }
        }

        document.getElementById('pointForm:graphX').value = mathX.toFixed(4);
        document.getElementById('pointForm:graphY').value = mathY.toFixed(4);

        const btn = document.getElementById('pointForm:graphSubmitBtn');
        if (btn) btn.click();
    });
}

function addPointToGraph(x, y, hit, r) {
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
    const table = document.getElementById('resultsTable_data');
    if (!table) {
        console.log('Table not found, waiting...');
        setTimeout(updatePointsFromTable, 500);
        return;
    }

    points = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
            try {
                const xText = cells[0].textContent.trim().replace(',', '.');
                const yText = cells[1].textContent.trim().replace(',', '.');
                const rText = cells[2].textContent.trim().replace(',', '.');

                const x = parseFloat(xText);
                const y = parseFloat(yText);
                const r = parseFloat(rText);
                const hitText = cells[3].textContent.trim();
                const hit = hitText.includes('Попадание') || hitText.toLowerCase().includes('hit');

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

    setTimeout(updateGraphAfterSubmit, 500);

    initFormHandlers();

    initCanvasClickHandler();

    const defaultR = document.querySelector('select[id*="r"]');
    if (defaultR && defaultR.value) {
        currentR = parseFloat(defaultR.value);
    }
    if (currentR) {
        drawGraph(currentR);
    } else {
        drawGraph(3);
    }

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

        hideValidationError();

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
            showValidationError(errors.join(' '));
            event.preventDefault();
            return false;
        }

        hideValidationError();
    });
}

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

    const xSelect = document.querySelector('[id*="x"]');
    const yInput = document.querySelector('[id*="y"]');
    const rSelect = document.querySelector('[id*="r"]');

    if (xSelect) xSelect.value = x;
    if (yInput) yInput.value = y;
    if (rSelect) rSelect.value = r;

    const submitButton = document.querySelector('[id*="checkPoint"]');
    if (submitButton && typeof PrimeFaces !== 'undefined') {
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

    updatePointsFromTable();

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

    initCanvasClickHandler();

    setTimeout(() => {
        enhanceSliderInteraction();
        initFormHandlers();
    }, 500);

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