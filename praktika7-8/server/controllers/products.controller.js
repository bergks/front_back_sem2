const Product = require('../models/Product.model');
const { invalidateCache, saveToCache } = require('../utils/redis');

// Вспомогательная функция поиска
function findProductOr404(id, res) {
  try{
    const product = Product.findById(id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return null;
    }
    return product;
  } catch (err){
    console.error('Find product error', err);
    res.status(500).json({error: 'Internal server error'})
    return null;
  }
}

// вспомогательная функция для очистки кэша (вне контроллера, потому что не должно быть доступа из других файлов. инкапсуляция)
async function invalidateProductsCache(productId = null) {
  await invalidateCache('products:all');
  
  if (productId) {
      await invalidateCache(`products:${productId}`);
      console.log(`Cache cleared for ${productId}`)
  }
  console.log('Cache cleared for all')
}

//MVC (model - данные, view - react, controller -  логика запросов)
//объект с методами. контроллер - отвечает за то, что делать, а роуты только за маршруты (разделение ответственности)
const productsController = { 
  //получить все товары
  async getAll(req, res) {
    try{
    const products = Product.getAll();

    await saveToCache(req.cacheKey, products, req.cacheTTL)

    return res.status(200).json({
      source: 'server',
      data: products
    });
    } catch (err) {
      console.log('Get products error:', err)
      res.status(500).json({error: 'Internal server error'})
    }
  },

// Получить товар по ID
async getById(req, res) {
  try{
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    if (req.cacheKey) {
      await saveToCache(req.cacheKey, product, req.cacheTTL);
    }

    res.status(200).json({
      source: 'server',
      data: product});
  } catch (err) {
    console.error('Find product by id error:', err)
    res.status(500).json({error: 'Internal server error'})
  }
},

// Создать товар
create(req, res) {
  try{
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
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({error: 'Internal server error'})
  }
},

// Обновить товар
async update(req, res) {
  try{
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    const { name, category, description, price, stock, imageUrl } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (category !== undefined) updates.category = category.trim();
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) updates.price = Number(price);
    if (stock !== undefined) updates.stock = Number(stock);
    if (imageUrl !== undefined) updates.imageUrl = imageUrl.trim();

    const updatedProduct = Product.update(req.params.id, updates);
    
    await invalidateProductsCache(product.id)

    res.status(200).json({
      message: 'Product updated',
      data: updatedProduct
    });
  } catch (err) {
    console.error('Update user error:', err)
    res.status(500).json({error: 'Internal server error'})
  }
},

//удалить товар + вренуть удаленные данные
async delete(req, res) {
  try{
    const deleted = Product.delete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
    }

    await invalidateProductsCache();

    res.status(200).json({
      message: "Product deleted",
      data: deleted
    });
  } catch (err) {
    console.error('Delete user error:', err)
    res.status(500).json({error: 'Internal server error'})
  }
  },
};

//экспрот объекта из модуля, чтобы стал доступен в других файлах
module.exports = productsController;