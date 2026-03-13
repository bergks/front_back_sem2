// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const productsRoutes = require('./products.routes');

// Все маршруты /api/auth/* идут в authRoutes
router.use('/auth', authRoutes);

// Все маршруты /api/products/* идут в productsRoutes
router.use('/products', productsRoutes);

module.exports = router;