const User = require('../models/User.model');
const { invalidateCache, saveToCache } = require('../utils/redis');

//вспомогательная функция очситки кэша
async function invalidateUsersCache(userId = null) {
    try {
        await invalidateCache("users:all");
        console.log('Cache cleared for all')
        if (userId){
            await invalidateCache(`users:${userId}`)
            console.log(`Cache cleared for user ${userId}`)
        }
    }
    catch (err) {
        console.error("Users cache invalidate error")
    }
}

//контроллер для работы с пользователями
const adminController = {
    //список всех пользователей
    async getUsersList(req, res) {
        try {
            const users = await User.getAll();

            //redis 21:сохранение в кэш по ключу
            if (req.cacheKey) {
                await saveToCache(req.cacheKey, users, req.cacheTTL);
            }

            //добавлен источник данных, чтобы проверять, когда из кэша приходят, а когда с сервера (то есть был запрос)
            return res.status(200).json({
                source: 'server',
                data: users});
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    //пользователь по id
    async getUserById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: 'User with this id does not exsist' });
            }
            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            //redis 21: сохранение в кэш
            if (req.cacheKey) {
                await saveToCache(req.cacheKey, user, req.cacheTTL);
            }

            //чтобы не присылался хэш пароля в ответе
            const {passwordHash, ...userForRes} = user

            return res.status(200).json({
                source: 'server',
                data: userForRes
            });
        } catch (error) {
            console.error('Get user by id error:', error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    //обновление пользователя
    async updateUser(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const { role, status } = req.body;

            const updates = {};
            if (role !== undefined) updates.role = role;
            if (status !== undefined) updates.status = status;

            const updatedUser = await User.update(req.params.id, updates);
            //redis 21: очистка кэша, тк данные изменены
            await invalidateUsersCache(user.id);

            //чтобы в ответе не присылался хэш пароля
            const {passwordHash, ...userForRes} = updatedUser

            res.status(200).json({
                message: 'User updated',
                data: userForRes
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    //Блокировка пользователя - полное удаление
    async banUser(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            const deleted = await User.delete(id);
            if (!deleted) {
                res.status(500).json({ error: "Failed to delete user" });
            }
            
            //redis 21: очистка кэша
            await invalidateUsersCache(user.id);

            res.status(200).json({
                message: 'User deleted',
                data: deleted
            })
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
};

//экспорт объекта из модуля
module.exports = adminController;