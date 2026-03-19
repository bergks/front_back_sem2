const User = require('../models/User.model');

const adminController = {
    async getUsersList(req, res) {
        try {
            const users = await User.getAll();

            res.set({
                'Cache-Control': 'no-store, no-cache, must-revalidate, private',
                'Pragma': 'no-cache',
                'Expires': '0'
            });

            return res.status(200).json(users);
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

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

            return res.status(200).json(user);
        } catch (error) {
            console.error('Get user by id error:', error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

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
            res.json(updatedUser);
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    async banUser(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            const deleted = await User.delete(id);
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(500).json({ error: "Failed to delete user" });
            }
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
};

module.exports = adminController;