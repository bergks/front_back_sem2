// models/User.model.js
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const { BCRYPT_ROUNDS } = require('../utils/constants');

// Временное хранилище (заменится на базу данных позже)
let users = [];

async function initAdmin() {
    if (users.length === 0) {
        const adminExists = users.some(u => u.role === 'admin');
        if (!adminExists) {
            const admin = {
                id: nanoid(6),
                email: "berg.ks@yandex.ru",
                first_name: "Ksenia",
                last_name: "Berg",
                passwordHash: await bcrypt.hash('123456', BCRYPT_ROUNDS),  // ← так правильно
                role: 'admin',
                status: 'active',
                createdAt: new Date().toISOString()
            };
            users.push(admin);
        }
    }
}

initAdmin();

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

    async getAll() {
        return users.map(({ passwordHash, ...user }) => user);
    },

    async update(id, updates) {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;

        users[index] = { ...users[index], ...updates };
        return users[index];
    },

    // Создать нового пользователя
    async create(userData) {
        const { email, first_name, last_name, password, role } = userData;

        const passwordHash = await hashPassword(password);

        const newUser = {
            id: nanoid(6),
            email,
            first_name,
            last_name,
            passwordHash,
            role: role || 'user',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        // Не возвращаем passwordHash
        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    },

    delete(id) {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return false;

        users.splice(index, 1);
        return true;
    }
};

module.exports = User;