// components/UserCard.jsx
import React, { useState } from 'react';
import { api } from '../api';

const UserCard = ({ user, onRoleChange, onStatusChange, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [selectedStatus, setSelectedStatus] = useState(user.status);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    onRoleChange(user.id, newRole);
    
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    onStatusChange(user.id, newStatus);
  };

  return (
    <div className={`user-card user-card--${user.status}`}>
      <div className="user-card__header">
        <div className="user-card__avatar">
          {user.first_name?.[0]}{user.last_name?.[0]}
        </div>
        <div className="user-card__info">
          <div className="user-card__name">
            {user.first_name} {user.last_name}
          </div>
          <div className="user-card__email">{user.email}</div>
        </div>
      </div>

      <div className="user-card__body">
        <div className="user-card__field">
          <label>Роль:</label>
          <select 
            value={selectedRole} 
            onChange={handleRoleChange}
            className="user-card__select"
          >
            <option value="user">Пользователь</option>
            <option value="seller">Продавец</option>
            <option value="admin">Администратор</option>
          </select>
        </div>

        <div className="user-card__field">
          <label>Статус:</label>
          <select 
            value={selectedStatus} 
            onChange={handleStatusChange}
            className="user-card__select"
          >
            <option value="active">Активен</option>
            <option value="banned">Забанен</option>
          </select>
        </div>
      </div>

      <div className="user-card__footer">
        <button 
          className="user-card__delete-btn"
          onClick={() => onDelete(user.id)}
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default UserCard;