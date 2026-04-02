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

// ===== ЗАПУСК =====
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📡 WebSocket готов к подключениям`);
    console.log(`🔔 VAPID публичный ключ: ${vapidKeys.publicKey.substring(0, 30)}...`);
});