let currentR = 3;
const canvas = document.getElementById('graphCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let points = [];

const baseUrl = window.contextPath || '';
const pointForm = document.getElementById('pointForm');

function drawGraph(r) {
    if (!canvas || !ctx) {
        return;
    }
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 180 / (r || 3);

    console.log('Drawing graph with R:', r, 'Scale:', scale);

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    drawShapes(ctx, centerX, centerY, scale, r);

    drawGrid(ctx, width, height, centerX, centerY, scale, r);

    drawAxes(ctx, width, height, centerX, centerY);

    drawLabels(ctx, centerX, centerY, scale, r);

    drawPoints(ctx, centerX, centerY, scale);
}

function drawShapes(ctx, centerX, centerY, scale, r) {
    ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.rect(centerX, centerY - r * scale, r * scale, r * scale);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - r * scale, centerY);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX, centerY + r * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, (r/2) * scale, 0, Math.PI / 2, false);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawGrid(ctx, width, height, centerX, centerY, scale, r) {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    const step = (r/2) * scale;
    for (let x = centerX; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let x = centerX; x > 0; x -= step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = centerY; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    for (let y = centerY; y > 0; y -= step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
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

function drawLabels(ctx, centerX, centerY, scale, r) {
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const xValues = [-r, -r/2, r/2, r];
    for (let value of xValues) {
        const x = centerX + value * scale;
        let label;
        if (value === -r) label = "-R";
        else if (value === -r/2) label = "-R/2";
        else if (value === r/2) label = "R/2";
        else if (value === r) label = "R";
        else label = value.toString();

        if (x > 20 && x < canvas.width - 20) {
            ctx.fillText(label, x, centerY + 20);

            ctx.beginPath();
            ctx.moveTo(x, centerY - 5);
            ctx.lineTo(x, centerY + 5);
            ctx.stroke();
        }
    }

    const yValues = [r, r/2, -r/2, -r];
    for (let value of yValues) {
        const y = centerY - value * scale;
        let label;
        if (value === r) label = "R";
        else if (value === r/2) label = "R/2";
        else if (value === -r/2) label = "-R/2";
        else if (value === -r) label = "-R";
        else label = value.toString();

        if (y > 20 && y < canvas.height - 20) {
            ctx.fillText(label, centerX - 25, y);

            ctx.beginPath();
            ctx.moveTo(centerX - 5, y);
            ctx.lineTo(centerX + 5, y);
            ctx.stroke();
        }
    }

    ctx.fillText('X', canvas.width - 15, centerY - 15);
    ctx.fillText('Y', centerX + 15, 15);
}

function drawPoints(ctx, centerX, centerY, scale) {
    points.forEach(point => {
        const x = centerX + point.x * scale;
        const y = centerY - point.y * scale;

        ctx.fillStyle = point.hit ? '#28a745' : '#dc3545';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function addPointToGraph(x, y, hit) {
    points.push({ x, y, hit });
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

    addPointToGraph(rowData.x, rowData.y, rowData.hit);
}

function convertToMathX(canvasX, R) {
    const centerX = canvas.width / 2;
    const scale = 180 / (R || 3);
    return (canvasX - centerX) / scale;
}

function convertToMathY(canvasY, R) {
    const centerY = canvas.height / 2;
    const scale = 180 / (R || 3);
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

window.addEventListener("load", function () {
    console.log('Page loaded, initializing graph and loading global history...');

    loadResultsFromServer();

    const clearHistoryButton = document.getElementById('clear-history-btn');
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', clearHistoryOnServer);
    }

    const defaultR = document.querySelector('input[name="r"]:checked');
    if (defaultR) {
        currentR = parseFloat(defaultR.value);
    }
    drawGraph(currentR);
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

        // Валидация полей
        const xChecked = document.querySelector("input[name='x']:checked");
        if (!xChecked) {
            document.getElementById("x-error").textContent = "Выберите значение X.";
            valid = false;
        }

        const yInput = document.querySelector("input[name='y']");
        const yValue = yInput.value.trim();
        const y = parseFloat(yValue);
        if (isNaN(y) || y < -3 || y > 5) {
            document.getElementById("y-error").textContent = "Введите число от -3 до 5.";
            valid = false;
        }

        const rChecked = document.querySelector("input[name='r']:checked");
        if (!rChecked) {
            document.getElementById("r-error").textContent = "Выберите значение R.";
            valid = false;
        }

        if (!valid) {
            event.preventDefault();
            return false;
        }

        // Если валидация прошла успешно, форма отправится обычным way
        // и пользователь будет перенаправлен на страницу результата
    });
}

document.querySelectorAll('input[name="r"]').forEach(radio => {
    radio.addEventListener('change', function() {
        currentR = parseFloat(this.value);
        drawGraph(currentR);
    });
});

let lastValidY = '';

const yField = document.querySelector('input[name="y"]');
if (yField) {
    yField.addEventListener('input', function (e) {
        const value = e.target.value;
        const errorElement = document.getElementById('y-error');
        const regex = /^-?\d*(\.\d*)?$/;
        if (regex.test(value)) {
            lastValidY = value;
            errorElement.textContent = '';
        } else {
            errorElement.textContent = 'Только числа разрешены';
            e.target.value = lastValidY;
        }
    });
}

if (canvas) {
    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const mathX = convertToMathX(x, currentR);
        const mathY = convertToMathY(y, currentR);

        hideServerError();
        document.getElementById("y-error").textContent = "";

        if (mathY < -3 || mathY > 5) {
            document.getElementById("y-error").textContent = "Y должен быть в диапазоне от -3 до 5";
            return;
        }

        const validX = [-3, -2, -1, 0, 1, 2, 3, 4, 5];
        let roundedX = validX[0];
        let minDiff = Math.abs(mathX - roundedX);

        for (let i = 1; i < validX.length; i++) {
            const diff = Math.abs(mathX - validX[i]);
            if (diff < minDiff) {
                minDiff = diff;
                roundedX = validX[i];
            }
        }

        if (currentR) {
            submitPointFromGraph(roundedX, mathY, currentR);
        } else {
            document.getElementById("r-error").textContent = "Сначала выберите радиус R";
        }
    });
}

function submitPointFromGraph(x, y, r) {
    if (!pointForm) {
        return;
    }

    const xInput = pointForm.querySelector(`input[name='x'][value='${x}']`);
    if (xInput) {
        xInput.checked = true;
    }

    const yInput = pointForm.querySelector("input[name='y']");
    if (yInput) {
        yInput.value = (Math.round(y * 1000) / 1000).toString();
    }

    const rInput = pointForm.querySelector(`input[name='r'][value='${r}']`);
    if (rInput) {
        rInput.checked = true;
    }

    if (typeof pointForm.requestSubmit === 'function') {
        pointForm.requestSubmit();
    } else {
        pointForm.submit();
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

document.addEventListener('DOMContentLoaded', function() {
    initCookieConsent();
    initChatWidget();
    createFloatingConsultants();
});