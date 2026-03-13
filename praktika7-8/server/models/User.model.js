// models/User.model.js
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const { BCRYPT_ROUNDS } = require('../utils/constants');

// Временное хранилище (заменится на базу данных позже)
let users = [];

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

const User = {
  // Найти пользователя по email
  async findByEmail(email) {
    return users.find(u => u.email === email);
  },
  
  // Найти пользователя по ID
  async findById(id) {
    return users.find(u => u.id === id);
  },
  
  // Создать нового пользователя
  async create(userData) {
    const { email, first_name, last_name, password } = userData;
    
    const passwordHash = await hashPassword(password);
    
    const newUser = {
      id: nanoid(6),
      email,
      first_name,
      last_name,
      passwordHash,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Не возвращаем passwordHash
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
};

module.exports = User;