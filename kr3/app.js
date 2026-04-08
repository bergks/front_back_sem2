// app.js - навигация и логика заметок

let globalLoadNotes = null;

const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');
const enablePushBtn = document.getElementById('enable-push');
const disablePushBtn = document.getElementById('disable-push');

const socket = io('http://localhost:3001', {
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    timeout: 5000,
    autoConnect: true
});

// Обработка ошибок подключения
socket.on('connect_error', (error) => {
    console.warn('⚠️ WebSocket не доступен (сервер не запущен)');
});

socket.on('reconnect_failed', () => {
    console.warn('❌ WebSocket: не удалось подключиться после 3 попыток');
});

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// ===== НАВИГАЦИЯ =====
function setActiveButton(activeId) {
    [homeBtn, aboutBtn].forEach(btn => btn.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

async function updateButtonState() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        enablePushBtn.style.display = 'none';
        disablePushBtn.style.display = 'inline-block';
    } else {
        enablePushBtn.style.display = 'inline-block';
        disablePushBtn.style.display = 'none';
    }
}

window.addEventListener('storage', (event) => {
    if (event.key === 'pushSubscriptionStatus') {
        updateButtonState();
    }
});

async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push не поддерживается');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BElbp5l7uhT4iDFXk6lpqqn4woTrAaBQU7dxjB33eIadzEdwRxf8vt9GWavfREQKMdZBoyoMo9Arke6IkhIrg-o')
        });

        await fetch('http://localhost:3001/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });

        console.log('✅ Подписка на push отправлена');

        localStorage.setItem('pushSubscriptionStatus', 'subscribed');
        updateButtonState();
    } catch (err) {
        console.error('❌ Ошибка подписки на push:', err);
    }
}

async function unsubscribeFromPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await fetch('http://localhost:3001/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: subscription.endpoint })
            });
            await subscription.unsubscribe();
            console.log('✅ Отписка выполнена');
            localStorage.setItem('pushSubscriptionStatus', 'unsubscribed');
            updateButtonState();
        }
    } catch (err) {
        console.error('❌ Ошибка отписки:', err);
    }
}

async function loadContent(page) {
    try {
        const response = await fetch(`/content/${page}.html`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        contentDiv.innerHTML = html;

        if (page === 'home') {
            initNotes();
        }
    } catch (err) {
        console.error('Ошибка загрузки:', err);
        contentDiv.innerHTML = '<p class="error">⚠️ Ошибка загрузки страницы. Проверьте соединение.</p>';
    }
}

//// ===== ЗАМЕТКИ =====
function initNotes() {
    const form = document.getElementById('note-form');
    const input = document.getElementById('note-input');
    const reminderTime = document.getElementById('reminder-time');
    const list = document.getElementById('notes-list');

    if (!form || !input || !list) return;

    // Генерация уникального ID
    function generateId() {
        return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Форматирование времени
    function formatReminderTime(timestamp) {
        const date = new Date(timestamp);
        const day = date.toLocaleDateString();
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${day} в ${time}`;
    }

    // Загрузка заметок
    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');

        if (notes.length === 0) {
            list.innerHTML = '<li class="empty">📭 Нет заметок. Добавьте первую!</li>';
            return;
        }

        list.innerHTML = notes.map((note, index) => {
            let reminderHtml = '';
            if (note.reminder) {
                reminderHtml = `
                    <div class="note-reminder-info">
                        Напоминание: ${formatReminderTime(note.reminder)}
                    </div>
                `;
            }
            return `
                <li>
                    <div class="note-content">
                        <span>${escapeHtml(note.text)}</span>
                        ${reminderHtml}
                    </div>
                    <button class="delete-btn" data-id="${note.id}" data-index="${index}">✖ Удалить</button>
                </li>
            `;
        }).join('');

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const index = parseInt(btn.dataset.index);
                deleteNote(index, id);
            });
        });
    }

    globalLoadNotes = loadNotes;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Универсальная функция добавления заметки
    function addNote(text, reminderTimestamp = null) {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const newNote = {
            id: generateId(),
            text: text,
            reminder: reminderTimestamp,
            createdAt: Date.now()
        };
        notes.push(newNote);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();

        // Отправляем через WebSocket
        socket.emit('newTask', {
            text: text,
            timestamp: new Date().toISOString(),
            hasReminder: !!reminderTimestamp
        });

        // Если есть напоминание - планируем на сервере
        if (reminderTimestamp) {
            socket.emit('newReminder', {
                id: newNote.id,
                text: text,
                reminderTime: reminderTimestamp
            });
        }
    }

    function deleteNote(index, id) {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
        socket.emit('deleteReminder', { id: id });
    }

    function showNotificationMessage(message, bgColor = '#704af7') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            cursor: pointer;
        `;
        notification.onclick = () => notification.remove();
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Обработка формы (одна форма для всего)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();

        if (!text) {
            showNotificationMessage('⚠️ Введите текст заметки', '#dc3545');
            return;
        }

        let reminderTimestamp = null;
        const timeValue = reminderTime.value;

        // Если пользователь заполнил дату
        if (timeValue) {
            reminderTimestamp = new Date(timeValue).getTime();

            if (reminderTimestamp <= Date.now()) {
                showNotificationMessage('⚠️ Время напоминания должно быть в будущем', '#dc3545');
                return;
            }
        }

        addNote(text, reminderTimestamp);
        input.value = '';
        reminderTime.value = '';
    });

    loadNotes();
}

// ===== WEBSOCKET СОБЫТИЯ =====
// ===== WEBSOCKET СОБЫТИЯ =====
socket.on('taskAdded', (task) => {
    console.log('📨 Задача от другого клиента:', task);
    
    // Показываем уведомление только для обычных заметок (без напоминания)
    if (!task.hasReminder) {
        showNotificationMessage(`📌 Новая заметка`, '#704af7');
    }
    
    if (task.hasReminder) {
        showNotificationMessage(`🔔 Новое напоминание`, '#704af7');
    }

    if (globalLoadNotes) {
        globalLoadNotes();
    }
});

socket.on('reminderSent', (data) => {
    console.log('🔔 Напоминание отправлено:', data);
    
    // Показываем уведомление о сработавшем напоминании
    showNotificationMessage(`🔔 НАПОМИНАНИЕ: ${data.text}`, '#ff9800'); // Оранжевое для отличия
    
    if (globalLoadNotes) {
        globalLoadNotes();
    }
});

// Функция showNotificationMessage должна быть доступна глобально
window.showNotificationMessage = function (message, bgColor = '#704af7') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        cursor: pointer;
    `;
    notification.onclick = () => notification.remove();
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
};

// ===== РЕГИСТРАЦИЯ SERVICE WORKER =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker зарегистрирован:', registration.scope);

            await updateButtonState();
        } catch (err) {
            console.error('❌ Ошибка регистрации Service Worker:', err);
        }
    });
} else {
    console.warn('⚠️ Service Worker не поддерживается');
}

if (enablePushBtn) {
    enablePushBtn.addEventListener('click', async () => {
        if (Notification.permission === 'denied') {
            alert('Уведомления запрещены. Разрешите их в настройках браузера.');
            return;
        }
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('Необходимо разрешить уведомления.');
                return;
            }
        }
        await subscribeToPush();
        enablePushBtn.style.display = 'none';
        disablePushBtn.style.display = 'inline-block';
    });
}

if (disablePushBtn) {
    disablePushBtn.addEventListener('click', async () => {
        await unsubscribeFromPush();
        disablePushBtn.style.display = 'none';
        enablePushBtn.style.display = 'inline-block';
    });
}

// ===== КНОПКИ НАВИГАЦИИ =====
homeBtn.addEventListener('click', () => {
    setActiveButton('home-btn');
    loadContent('home');
});

aboutBtn.addEventListener('click', () => {
    setActiveButton('about-btn');
    loadContent('about');
});

socket.on('reminderSnoozed', (data) => {
    console.log('🔄 Напоминание отложено, обновляем карточку:', data);
    
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const noteIndex = notes.findIndex(note => note.id === data.id);
    
    if (noteIndex !== -1) {
        notes[noteIndex].reminder = data.newReminderTime;
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (globalLoadNotes) {
            globalLoadNotes();
        }
        
        const newDate = new Date(data.newReminderTime);
        const formattedTime = newDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        showNotificationMessage(`⏰ Напоминание отложено до ${formattedTime}`, '#ff9800');
    }
});

loadContent('home');