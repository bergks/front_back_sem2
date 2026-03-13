// controllers/products.controller.js
const Product = require('../models/Product.model');

// Вспомогательная функция для поиска товара (используется только здесь)
function findProductOr404(id, res) {
  const product = Product.findById(id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

const productsController = {
  // Получить все товары
  getAll(req, res) {
    res.json(Product.getAll());
  },

  // Получить товар по ID
  getById(req, res) {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    res.json(product);
  },

  // Создать товар
  create(req, res) {
    const { name, category, description, price, stock = 0, imageUrl } = req.body;

    if (!name || !category || !description || price === undefined || !imageUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newProduct = Product.create({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      imageUrl: imageUrl.trim()
    });

    res.status(201).json(newProduct);
  },

  // Обновить товар
  update(req, res) {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    const { name, category, description, price, stock, imageUrl } = req.body;

    // Собираем только те поля, которые пришли
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (category !== undefined) updates.category = category.trim();
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) updates.price = Number(price);
    if (stock !== undefined) updates.stock = Number(stock);
    if (imageUrl !== undefined) updates.imageUrl = imageUrl.trim();

    const updatedProduct = Product.update(req.params.id, updates);
    res.json(updatedProduct);
  },

  // Удалить товар
  delete(req, res) {
    const deleted = Product.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(204).send();
  }
};

module.exports = productsController;