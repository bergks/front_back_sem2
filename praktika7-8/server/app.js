// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const { PORT, CORS_ORIGIN } = require('./utils/constants');
const loggerMiddleware = require('./middleware/logger.middleware');
const routes = require('./routes');
const { setupSwagger } = require('./config/swagger');

const { initRedis } = require('./utils/redis')

const app = express();

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(loggerMiddleware);

setupSwagger(app);

let refreshTokens = new Set();

initRedis()

// Подключаем все маршруты
app.use('/api', routes);

// 404 для остальных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});