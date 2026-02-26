const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const path = require('path');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Начальные данные - 10 товаров
let products = [
  { id: nanoid(6), name: 'Эспрессо', category: 'Кофе', description: 'Крепкий черный кофе', price: 150, stock: 20, imageUrl: '/uploads/espresso.jpg'},
  { id: nanoid(6), name: 'Американо', category: 'Кофе', description: 'Эспрессо с горячей водой', price: 170, stock: 18, imageUrl: '/uploads/americano.webp'},
  { id: nanoid(6), name: 'Капучино', category: 'Кофе', description: 'Кофе с молочной пеной', price: 220, stock: 15, imageUrl: '/uploads/capuccino.webp'},
  { id: nanoid(6), name: 'Латте', category: 'Кофе', description: 'Кофе с большим количеством молока', price: 240, stock: 12, imageUrl: '/uploads/latte.webp'},
  { id: nanoid(6), name: 'Раф', category: 'Кофе', description: 'Кофе со сливками и ванилью', price: 260, stock: 10, imageUrl: '/uploads/raf.webp'},
  { id: nanoid(6), name: 'Матча латте', category: 'Чай', description: 'Японский зеленый чай с молоком', price: 280, stock: 8, imageUrl: '/uploads/matcha_latte.webp'},
  { id: nanoid(6), name: 'Облепиховый чай', category: 'Чай', description: 'Витаминный чай с облепихой', price: 250, stock: 7, imageUrl: '/uploads/sea_buckthorn_tea.webp'},
  { id: nanoid(6), name: 'Брауни', category: 'Десерты', description: 'Шоколадное пирожное', price: 180, stock: 5, imageUrl: '/uploads/browny.webp'},
  { id: nanoid(6), name: 'Чизкейк', category: 'Десерты', description: 'Сливочный десерт', price: 220, stock: 4, imageUrl: '/uploads/cheescake.webp'},
  { id: nanoid(6), name: 'Круассан', category: 'Десерты', description: 'Слоеная выпечка', price: 120, stock: 15, imageUrl: '/uploads/croisant.webp'},
];

// Middleware
app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${res.statusCode} ${req.path}`);
  });
  next();
});

// Вспомогательная функция для поиска товара
function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',           
    info: {
      title: 'API управления товарами',
      version: '1.0.0',
      description: 'Простое API для управления товарами'
    },
    servers: [
      { url: `http://localhost:${port}`, description: 'Локальный сервер' }
    ],
  },
  apis: ['./app.js'],            
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
   
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *         - price
 *         - imageUrl
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор товара
 *           example: "abc123"
 *         name:
 *           type: string
 *           description: Название товара
 *           example: "Капучино"
 *         category:
 *           type: string
 *           description: Категория товара
 *           example: "Кофе"
 *         description:
 *           type: string
 *           description: Описание товара
 *           example: "Кофе с молочной пеной"
 *         price:
 *           type: number
 *           description: Цена товара в рублях
 *           example: 220
 *         imageUrl:
 *           type: string
 *           description: URL изображения товара
 *           example: "https://example.com/coffee.jpg"
 *         stock:
 *           type: integer
 *           description: Количество на складе (по умолчанию 0)
 *           example: 15
 *           default: 0
 */

// API Routes
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     description: Возвращает массив всех товаров в магазине
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Успешный ответ со списком товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.get('/api/products', (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     description: Возвращает один товар по его уникальному идентификатору
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Уникальный ID товара (например, "abc123")
 *         example: "abc123"
 *     responses:
 *       200:
 *         description: Товар найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     description: Добавляет новый товар в магазин. ID генерируется автоматически
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название товара
 *                 example: "Раф"
 *               category:
 *                 type: string
 *                 description: Категория товара
 *                 example: "Кофе"
 *               description:
 *                 type: string
 *                 description: Описание товара
 *                 example: "Кофе со сливками и ванилью"
 *               price:
 *                 type: number
 *                 description: Цена товара в рублях
 *                 example: 260
 *               stock:
 *                 type: integer
 *                 description: Количество на складе (по умолчанию 0)
 *                 example: 10
 *                 default: 0
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка в данных запроса (отсутствуют обязательные поля)
 */
app.post('/api/products', (req, res) => {
  const { name, category, description, price, stock = 0, imageUrl} = req.body;

  if (!name || !category || !description || price === undefined || stock === undefined || imageUrl === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock),
    imageUrl: imageUrl.trim()
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить существующий товар
 *     description: Обновляет одно или несколько полей товара. Отправлять нужно только изменяемые поля
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара для обновления
 *         example: "abc123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Новое название товара
 *                 example: "Раф ванильный"
 *               category:
 *                 type: string
 *                 description: Новая категория
 *                 example: "Кофе"
 *               description:
 *                 type: string
 *                 description: Новое описание
 *                 example: "Кофе с ванильным сиропом"
 *               price:
 *                 type: number
 *                 description: Новая цена
 *                 example: 280
 *               stock:
 *                 type: integer
 *                 description: Новое количество на складе
 *                 example: 8
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Товар с указанным ID не найден
 */
app.patch('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  const { name, category, description, price, stock, imageUrl } = req.body;

  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (imageUrl !== undefined) product.imageUrl = imageUrl.trim();

  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     description: Удаляет товар по ID. При успехе возвращает пустой ответ
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара для удаления
 *         example: "abc123"
 *     responses:
 *       204:
 *         description: Товар успешно удален (нет тела ответа)
 *       404:
 *         description: Товар с указанным ID не найден
 */
app.delete('/api/products/:id', (req, res) => {
  const exists = products.some(p => p.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Product not found" });

  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

// 404 для остальных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});