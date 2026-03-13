// controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } = require('../utils/constants');

// Вспомогательные функции (можно оставить здесь)
async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

const authController = {
  // Регистрация
  async register(req, res) {
    try {
      const { email, first_name, last_name, password } = req.body;

      if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User with this email already exists" });
      }

      const newUser = await User.create({
        email,
        first_name,
        last_name,
        password
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Вход
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const accessToken = jwt.sign(
        { sub: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({ accessToken });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Получить текущего пользователя
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.sub);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      });
    } catch (error) {
      console.error('GetMe error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = authController;