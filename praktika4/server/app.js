const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;

// Начальные данные - 10 товаров
let products = [
  { id: nanoid(6), name: 'Эспрессо', category: 'Кофе', description: 'Крепкий черный кофе', price: 150, stock: 20 },
  { id: nanoid(6), name: 'Американо', category: 'Кофе', description: 'Эспрессо с горячей водой', price: 170, stock: 18 },
  { id: nanoid(6), name: 'Капучино', category: 'Кофе', description: 'Кофе с молочной пеной', price: 220, stock: 15 },
  { id: nanoid(6), name: 'Латте', category: 'Кофе', description: 'Кофе с большим количеством молока', price: 240, stock: 12 },
  { id: nanoid(6), name: 'Раф', category: 'Кофе', description: 'Кофе со сливками и ванилью', price: 260, stock: 10 },
  { id: nanoid(6), name: 'Матча латте', category: 'Чай', description: 'Японский зеленый чай с молоком', price: 280, stock: 8 },
  { id: nanoid(6), name: 'Облепиховый чай', category: 'Чай', description: 'Витаминный чай с облепихой', price: 250, stock: 7 },
  { id: nanoid(6), name: 'Брауни', category: 'Десерты', description: 'Шоколадное пирожное', price: 180, stock: 5 },
  { id: nanoid(6), name: 'Чизкейк', category: 'Десерты', description: 'Сливочный десерт', price: 220, stock: 4 },
  { id: nanoid(6), name: 'Круассан', category: 'Десерты', description: 'Слоеная выпечка', price: 120, stock: 15 },
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

// API Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const { name, category, description, price, stock } = req.body;

  if (!name || !category || !description || price === undefined || stock === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock)
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.patch('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  const { name, category, description, price, stock } = req.body;

  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);

  res.json(product);
});

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