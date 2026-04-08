// sw.js (рабочая версия)

const STATIC_CACHE = 'app-shell-v3';
const DYNAMIC_CACHE = 'dynamic-content-v2';

// Статические ресурсы (App Shell)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/index.css',
    '/manifest.json',
    '/node_modules/socket.io-client/dist/socket.io.min.js',
    '/icons/favicon-16x16.png',
    '/icons/favicon-32x32.png',
    '/icons/favicon-48x48.png',
    '/icons/favicon-64x64.png',
    '/icons/favicon-128x128.png',
    '/icons/favicon-256x256.png',
    '/icons/favicon-512x512.png'
];

// ===== УСТАНОВКА =====
self.addEventListener('install', (event) => {
    console.log('🔧 SW: установка v2');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Кэшируем статические ресурсы...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.error('❌ Ошибка кэширования:', err))
    );
});

// ===== АКТИВАЦИЯ =====
self.addEventListener('activate', (event) => {
    console.log('🚀 SW: активация v2');

    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                    .map(key => {
                        console.log(`🗑 Удаляем старый кэш: ${key}`);
                        return caches.delete(key);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// ===== ПЕРЕХВАТ ЗАПРОСОВ =====
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (url.origin !== location.origin) return;

    if (url.pathname.startsWith('/content/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(async (error) => {
                    console.warn(`⚠️ Сеть недоступна для ${url.pathname}, ищем в кэше...`);
                    const cached = await caches.match(event.request);
                    if (cached) {
                        console.log(`📦 Найдено в кэше: ${url.pathname}`);
                        return cached;
                    }
                    console.error(`❌ Файл не найден: ${url.pathname}`);
                    return new Response(
                        `<div class="error">
                            <h3>⚠️ Страница не найдена</h3>
                            <p>Файл ${url.pathname} не найден.</p>
                        </div>`,
                        {
                            status: 404,
                            headers: { 'Content-Type': 'text/html' }
                        }
                    );
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log(`📦 Из кэша: ${url.pathname}`);
                    return cachedResponse;
                }
                console.log(`🌐 Из сети: ${url.pathname}`);
                return fetch(event.request);
            })
    );
});

// ===== PUSH-УВЕДОМЛЕНИЯ =====
self.addEventListener('push', (event) => {
    let data = {
        title: '📝 Новая заметка!',
        body: 'У вас новая заметка',
        reminderId: null
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: '/icons/favicon-128x128.png',
        badge: '/icons/favicon-48x48.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/',
            reminderId: data.reminderId
        }
    };

    if (data.reminderId) {
        options.actions = [
            {
                action: 'snooze',
                title: '⏰ Отложить на 5 минут'
            }
        ];
        options.requireInteraction = true;
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;
    const reminderId = notification.data.reminderId;
    
    notification.close();
    
    if (action === 'snooze' && reminderId) {
        event.waitUntil(
            fetch(`/snooze?reminderId=${reminderId}`, {
                method: 'POST'
            })
            .then(response => {
                if (response.ok) {
                    console.log('✅ Напоминание отложено');
                } else {
                    console.error('❌ Ошибка при откладывании');
                }
            })
            .catch(err => console.error('❌ Snooze failed:', err))
        );
    } else {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});