// models/Product.model.js
const { nanoid } = require('nanoid');

// Начальные данные товаров
let products = [
  { id: nanoid(6), name: 'Эспрессо', category: 'Кофе', description: 'Крепкий черный кофе', price: 150, stock: 20, imageUrl: '/uploads/espresso.jpg' },
  { id: nanoid(6), name: 'Американо', category: 'Кофе', description: 'Эспрессо с горячей водой', price: 170, stock: 18, imageUrl: '/uploads/americano.webp' },
  { id: nanoid(6), name: 'Капучино', category: 'Кофе', description: 'Кофе с молочной пеной', price: 220, stock: 15, imageUrl: '/uploads/capuccino.webp' },
  { id: nanoid(6), name: 'Латте', category: 'Кофе', description: 'Кофе с большим количеством молока', price: 240, stock: 12, imageUrl: '/uploads/latte.webp' },
  { id: nanoid(6), name: 'Раф', category: 'Кофе', description: 'Кофе со сливками и ванилью', price: 260, stock: 10, imageUrl: '/uploads/raf.webp' },
  { id: nanoid(6), name: 'Матча латте', category: 'Чай', description: 'Японский зеленый чай с молоком', price: 280, stock: 8, imageUrl: '/uploads/matcha_latte.webp' },
  { id: nanoid(6), name: 'Облепиховый чай', category: 'Чай', description: 'Витаминный чай с облепихой', price: 250, stock: 7, imageUrl: '/uploads/sea_buckthorn_tea.webp' },
  { id: nanoid(6), name: 'Брауни', category: 'Десерты', description: 'Шоколадное пирожное', price: 180, stock: 5, imageUrl: '/uploads/browny.webp' },
  { id: nanoid(6), name: 'Чизкейк', category: 'Десерты', description: 'Сливочный десерт', price: 220, stock: 4, imageUrl: '/uploads/cheescake.webp' },
  { id: nanoid(6), name: 'Круассан', category: 'Десерты', description: 'Слоеная выпечка', price: 120, stock: 15, imageUrl: '/uploads/croisant.webp' },
];

const Product = {
  // Получить все товары
  getAll() {
    return products;
  },
  
  // Найти товар по ID
  findById(id) {
    return products.find(p => p.id === id);
  },
  
  // Создать новый товар
  create(productData) {
    const newProduct = {
      id: nanoid(6),
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock || 0)
    };
    products.push(newProduct);
    return newProduct;
  },
  
  // Обновить товар
  update(id, updates) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    products[index] = { ...products[index], ...updates };
    return products[index];
  },
  
  // Удалить товар
  delete(id) {
    const exists = products.some(p => p.id === id);
    if (!exists) return false;
    
    products = products.filter(p => p.id !== id);
    return true;
  }
};

module.exports = Product;