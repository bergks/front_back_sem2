// pages/AdminUsersPage/AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import UserCard from './UserCard';
import './AdminUsersPage.scss';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Load users error:', err);
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUser(userId, { role: newRole });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      console.error('Update role error:', err);
      alert('Ошибка обновления роли');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.updateUser(userId, { status: newStatus });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ));
    } catch (err) {
      console.error('Update status error:', err);
      alert('Ошибка обновления статуса');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить пользователя?')) return;
    
    try {
      await api.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Ошибка удаления пользователя');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <h1>Управление пользователями</h1>
        <div className="admin-users-stats">
          Всего пользователей: {users.length}
        </div>
      </div>

      <div className="users-grid">
        {users.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onRoleChange={handleRoleChange}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteUser}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminUsersPage;