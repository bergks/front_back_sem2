// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { PORT } = require('../utils/constants');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API управления товарами',
      version: '1.0.0',
      description: 'Простое API для управления товарами и изучения авторизации'
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Локальный сервер' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js',
    './config/swagger.js'
  ], // ← важно: теперь Swagger ищет в папке routes!
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// config/swaggerSchemas.js
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

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор пользователя
 *           example: "abc123"
 *         email:
 *           type: string
 *           format: email
 *           description: Email пользователя (логин)
 *           example: "ivan@example.com"
 *         first_name:
 *           type: string
 *           description: Имя пользователя
 *           example: "Иван"
 *         last_name:
 *           type: string
 *           description: Фамилия пользователя
 *           example: "Петров"
 */

module.exports = { setupSwagger };