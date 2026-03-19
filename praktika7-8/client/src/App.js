// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.scss';

// Компоненты
import Header from './components/Header';
import ProductsPage from './pages/ProductsPage/Products';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import AdminUsersPage from './components/AdminUsersPage'

// API
import { api } from './api';

function App() {
  // Состояния авторизации
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Для отображения загрузки

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Пробуем получить данные пользователя
      const userData = await api.getMe();
      setUser(userData);
      setIsAuth(true);
    } catch (error) {
      // Токен невалиден - чистим localStorage
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
    } finally {
      setLoading(false);
    }
  };

  // Проверка авторизации при загрузке
  useEffect(() => {
    checkAuth();
  }, []);

  // Обработчик выхода
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Очищаем всё в любом случае
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      setIsAuth(false);
      setUser(null);
    }
  };

  // Показываем загрузку, пока проверяем авторизацию
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Header
          isAuth={isAuth}
          user={user}
          onLogout={handleLogout}
        />

        <main className="main-content">
          <Routes>
            {/* Публичные маршруты */}
            <Route
              path="/login"
              element={
                !isAuth ?
                  <LoginPage onLogin={() => {
                    // После успешного логина обновляем состояние
                    checkAuth(); // или setIsAuth(true) и загружаем пользователя
                  }} /> :
                  <Navigate to="/products" />
              }
            />
            <Route
              path="/register"
              element={
                !isAuth ?
                  <RegisterPage onLogin={checkAuth} /> :
                  <Navigate to="/products" />
              }
            />

            {/* Защищенные маршруты */}
            <Route
              path="/products"
              element={isAuth ? <ProductsPage user={user} /> : <Navigate to="/login" />}
            />
            {/* Маршруты для админа */}
            <Route path="/users" element={
              <PrivateRoute isAuth={isAuth} requiredRole="admin" user={user}>
                <AdminUsersPage />
              </PrivateRoute>
            } />

            {/* Редирект с корневого пути */}
            <Route
              path="/"
              element={<Navigate to={isAuth ? "/products" : "/login"} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;