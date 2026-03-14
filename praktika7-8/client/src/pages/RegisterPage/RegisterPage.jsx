// pages/RegisterPage/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import './RegisterPage.scss';

const RegisterPage = ({ onLogin }) => { // используем тот же onLogin
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const errorMessages = {
        "All fields are required": 'Необходимо заполнить все поля',
        "User with this email already exists": "Пользоваетль с таким email уже существует",
        "Internal server error": "Ошиька на сервере"
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Проверка совпадения паролей
        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            setLoading(false);
            return;
        }

        try {
            // 1. Регистрация
            await api.register({
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                password: formData.password
            });

            // 2. Автоматический вход после регистрации
            await api.login({
                email: formData.email,
                password: formData.password
            });

            // 3. Проверяем авторизацию и получаем данные пользователя
            await onLogin();

            // 4. Редирект на товары
            navigate('/products');
        } catch (err) {
            console.error('Register error:', err);
            const serverError = err.response?.data?.error;
            const errorText = serverError || err.message || 'Произошла ошибка';

            const userFriendlyError = errorMessages[errorText] || errorText;

            setError(userFriendlyError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-card">
                    <h2 className="register-title">Регистрация в Coffee Shop</h2>

                    {error && (
                        <div className="register-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="first_name">Имя</label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Иван"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="last_name">Фамилия</label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Петров"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="ivan@example.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Пароль</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="********"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Подтверждение пароля</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="********"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>
                    </form>

                    <p className="register-login-link">
                        Уже есть аккаунт?{' '}
                        <Link to="/login">Войти</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;