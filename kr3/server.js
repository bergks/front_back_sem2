// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const vapidKeys = {
    publicKey: 'BElbp5l7uhT4iDFXk6lpqqn4woTrAaBQU7dxjB33eIadzEdwRxf8vt9GWavfREQKMdZBoyoMo9Arke6IkhIrg-o',
    privateKey: 'VHux6RwDzn9QExVS9kzosm4FCf8UOXGidzItOd93B_c'
};

// Настройка web-push
webpush.setVapidDetails(
    'mailto:berg.ks@yandex.ru',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Хранилище push-подписок
let subscriptions = [];

// Хранилище активных напоминаний
const reminders = new Map();

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ===== WEBSOCKET =====
io.on('connection', (socket) => {
    console.log('🟢 Клиент подключен:', socket.id);

    // Получаем новую задачу от клиента
    socket.on('newTask', (task) => {
        console.log('📝 Новая задача:', task.text);

        // Рассылаем всем подключенным клиентам
        io.emit('taskAdded', task);

        // Отправляем push-уведомления всем подписанным клиентам
        const payload = JSON.stringify({
            title: '📝 Новая заметка!',
            body: task.text
        });

        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload)
                .catch(err => console.error('❌ Push error:', err));
        });
    });

    socket.on('disconnect', () => {
        console.log('🔴 Клиент отключен:', socket.id);
    });

    socket.on('newReminder', (reminder) => {
        const { id, text, reminderTime } = reminder;
        const delay = reminderTime - Date.now();

        console.log(`⏰ Новое напоминание: "${text}" через ${Math.floor(delay / 1000)} сек`);

        if (delay <= 0) {
            console.log('⚠️ Время напоминания уже прошло');
            return;
        }

        const timeoutId = setTimeout(() => {
            console.log(`🔔 Отправка напоминания: "${text}" для id=${id}`);

            const payload = JSON.stringify({
                title: '🔔 Напоминание!',
                body: text,
                reminderId: id,
                timestamp: Date.now()
            });

            subscriptions.forEach(sub => {
                webpush.sendNotification(sub, payload)
                    .catch(err => console.error('❌ Push error:', err));
            });

            // Не удаляем напоминание, чтобы можно было отложить
            io.emit('reminderSent', { id, text, timestamp: Date.now() });
        }, delay);

        reminders.set(id, {
            timeoutId,
            text,
            reminderTime,
            socketId: socket.id
        });

        console.log(`📅 Напоминание запланировано, активных: ${reminders.size}`);
    });

    // Обработка удаления напоминания
    socket.on('deleteReminder', ({ id }) => {
        if (reminders.has(id)) {
            const reminder = reminders.get(id);
            clearTimeout(reminder.timeoutId);
            reminders.delete(id);
            console.log(`🗑 Напоминание ${id} удалено, осталось: ${reminders.size}`);
        }
    });
});

// ===== PUSH-ПОДПИСКИ =====
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    console.log('✅ Подписка сохранена, всего подписок:', subscriptions.length);
    res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    console.log('❌ Подписка удалена, осталось:', subscriptions.length);
    res.status(200).json({ message: 'Подписка удалена' });
});

// Эндпоинт для откладывания напоминания
app.post('/snooze', (req, res) => {
    const reminderId = req.query.reminderId;
    
    if (!reminderId || !reminders.has(reminderId)) {
        return res.status(400).json({ error: 'Reminder not found' });
    }
    
    const reminder = reminders.get(reminderId);
    clearTimeout(reminder.timeoutId);
    
    const snoozeDelay = 5 * 60 * 1000;
    const newReminderTime = Date.now() + snoozeDelay;
    
    const newTimeoutId = setTimeout(() => {
        const payload = JSON.stringify({
            title: '🔔 Напоминание (отложенное)',
            body: reminder.text,
            reminderId: reminderId,
            timestamp: Date.now()
        });
        
        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload)
                .catch(err => console.error('❌ Push error:', err));
        });
        
        reminders.delete(reminderId);
        io.emit('reminderSent', { id: reminderId, text: reminder.text, snoozed: true });
    }, snoozeDelay);
    
    reminders.set(reminderId, {
        timeoutId: newTimeoutId,
        text: reminder.text,
        reminderTime: newReminderTime,
        socketId: reminder.socketId
    });

    io.emit('reminderSnoozed', {
        id: reminderId,
        newReminderTime: newReminderTime,
        text: reminder.text
    });
    
    console.log(`⏰ Напоминание ${reminderId} отложено на 5 минут`);
    res.status(200).json({ message: 'Reminder snoozed for 5 minutes' });
});

// ===== ЗАПУСК =====
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📡 WebSocket готов к подключениям`);
    console.log(`🔔 VAPID публичный ключ: ${vapidKeys.publicKey.substring(0, 30)}...`);
});