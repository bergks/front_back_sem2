// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const adminController = require('../controllers/admin.controller');
const cacheMiddleware = require('../middleware/cache.middleware');
const { USERS_CACHE_TTL, PRODUCTS_CACHE_TTL } = require('../utils/constants.js')

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     description: Возвращает список всех пользователей (только для администраторов)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (не admin)
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/', cacheMiddleware(() => 'users:all', USERS_CACHE_TTL), adminController.getUsersList);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     description: Возвращает информацию о конкретном пользователе
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *         example: "abc123"
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (не admin)
 *       404:
 *         description: Пользователь не найден
 */
router.get('/:id', cacheMiddleware((req) => `users:${req.params.id}`, USERS_CACHE_TTL), adminController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить информацию пользователя
 *     description: Обновляет роль или статус пользователя
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *         example: "abc123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *                 description: Новая роль пользователя
 *                 example: "seller"
 *               status:
 *                 type: string
 *                 enum: [active, banned]
 *                 description: Новый статус пользователя
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Нет данных для обновления
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (не admin)
 *       404:
 *         description: Пользователь не найден
 */
router.put('/:id', adminController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Удалить пользователя
 *     description: Полностью удаляет пользователя из системы
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *         example: "abc123"
 *     responses:
 *       204:
 *         description: Пользователь успешно удален (нет тела ответа)
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (не admin)
 *       404:
 *         description: Пользователь не найден
 */
router.delete('/:id', adminController.banUser);

module.exports = router;