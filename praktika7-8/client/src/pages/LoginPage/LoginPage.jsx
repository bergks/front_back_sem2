// pages/LoginPage/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import './LoginPage.scss';

const LoginPage = ({ onLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const errorMessages = {
        'Invalid credentials': 'Неверный email или пароль',
        'email and password are required': 'Заполните все поля',
        "Internal server error": 'Ошибка на сервере'
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

        try {
            const response = await api.login(formData);

            // После успешного логина обновляем состояние в App
            if (onLogin) {
                onLogin();
            }

            // Редирект на страницу товаров
            navigate('/products');
        } catch (err) {
            console.error('Login error:', err);
            const serverError = err.response?.data?.error;
            const errorText = serverError || err.message || 'Произошла ошибка';

            const userFriendlyError = errorMessages[errorText] || errorText;

            setError(userFriendlyError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">Вход в Coffee Shop</h2>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
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

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>

                    <p className="login-register-link">
                        Нет аккаунта?{' '}
                        <Link to="/register">Зарегистрироваться</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;