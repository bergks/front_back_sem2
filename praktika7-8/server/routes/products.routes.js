// routes/products.routes.js
const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');  // ← исправил опечатку

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     description: Возвращает массив всех товаров. Доступно всем аутентифицированным пользователям (user, seller, admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный ответ со списком товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Не авторизован
 */
router.get('/', authMiddleware, productsController.getAll);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     description: Возвращает один товар по его уникальному идентификатору. Доступно всем аутентифицированным пользователям
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Уникальный ID товара
 *     responses:
 *       200:
 *         description: Товар найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
router.get('/:id', authMiddleware, productsController.getById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     description: Добавляет новый товар в магазин. Доступно только продавцам (seller) и администраторам (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *               - imageUrl
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Раф"
 *               category:
 *                 type: string
 *                 example: "Кофе"
 *               description:
 *                 type: string
 *                 example: "Кофе со сливками и ванилью"
 *               price:
 *                 type: number
 *                 example: 260
 *               stock:
 *                 type: integer
 *                 example: 10
 *                 default: 0
 *               imageUrl:
 *                 type: string
 *                 example: "/uploads/raf.jpg"
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка в данных запроса
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (недостаточно прав)
 */
router.post('/', authMiddleware, roleMiddleware(['seller', 'admin']), productsController.create);  // ← исправил запятые

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить существующий товар
 *     description: Обновляет одно или несколько полей товара. Доступно только продавцам (seller) и администраторам (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара для обновления
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
 *               imageUrl:
 *                 type: string
 *                 description: Новый URL изображения
 *                 example: "/uploads/raf-vanilla.jpg"
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (недостаточно прав)
 *       404:
 *         description: Товар не найден
 */
router.patch('/:id', authMiddleware, roleMiddleware(['seller', 'admin']), productsController.update);  // ← исправил запятые

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     description: Удаляет товар по ID. Доступно только администраторам (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара для удаления
 *     responses:
 *       204:
 *         description: Товар успешно удален (нет тела ответа)
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (недостаточно прав)
 *       404:
 *         description: Товар не найден
 */
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), productsController.delete);

module.exports = router;