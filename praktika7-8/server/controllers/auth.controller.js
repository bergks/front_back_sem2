// controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_SECRET, 
  REFRESH_EXPIRES_IN,
  BCRYPT_ROUNDS,
  } = require('../utils/constants');

let refreshTokens = new Set();

// Вспомогательные функции (можно оставить здесь)
async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateAccessToken(user) {
  return jwt.sign(
    { 
      sub: user.id, 
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
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

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      refreshTokens.add(refreshToken);

      res.json({ 
        accessToken, 
        refreshToken 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

    async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: "refreshToken is required" });
      }

      // Проверяем, существует ли токен в хранилище
      if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      try {
        // Проверяем валидность refresh-токена
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        
        // Находим пользователя
        const user = await User.findById(payload.sub);
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        // Ротация токенов: удаляем старый refresh-токен
        refreshTokens.delete(refreshToken);
        
        // Генерируем новую пару
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        
        // Сохраняем новый refresh-токен
        refreshTokens.add(newRefreshToken);

        res.json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        });
      } catch (err) {
        // Если токен невалидный, удаляем его из хранилища
        refreshTokens.delete(refreshToken);
        return res.status(401).json({ error: "Invalid or expired refresh token" });
      }
    } catch (error) {
      console.error('Refresh error:', error);
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
  },

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        refreshTokens.delete(refreshToken);
      }
      res.status(204).send();
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = authController;