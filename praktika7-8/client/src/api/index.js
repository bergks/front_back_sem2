import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    let accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      console.log('🔑 Добавляем токен к запросу:', config.url);
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// api/index.js - исправленный interceptors.response
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('❌ Ошибка ответа:', error.response?.status, error.config?.url);

    let accessToken = localStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');
    let originalRequest = error.config;

    // Проверяем, что это 401 и мы еще не пытались обновить
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Токен истек, пробуем обновить...');
      originalRequest._retry = true;

      // Если нет токенов - чистим и редиректим
      if (!accessToken || !refreshToken) {
        console.log('❌ Нет токенов для обновления');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(error);
      }

      try {
        console.log('📤 Отправляем refresh-запрос...');
        let response = await api.refresh(refreshToken);

        console.log('✅ Полный ответ от refresh:', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          config: response.config?.url
        });

        // Проверяем, что response.data существует
        if (!response.data) {
          console.error('❌ response.data is undefined!');
          throw new Error('No data in response');
        }

        console.log('✅ Новые токены получены', response.data);

        // Проверяем структуру данных
        if (!response.data.accessToken || !response.data.refreshToken) {
          console.error('❌ Неправильная структура ответа:', response.data);
          throw new Error('Invalid token structure');
        }


        let newAccessToken = response.data.accessToken;
        let newRefreshToken = response.data.refreshToken;

        // Обновляем заголовок исходного запроса
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Сохраняем новые токены
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('🔁 Повторяем исходный запрос');
        return apiClient(originalRequest);

      } catch (refreshError) {
        console.log('❌ Ошибка обновления токена:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  // ===== ТОВАРЫ =====
  getProducts: async () => {
    const response = await apiClient.get('/products');
    return response.data;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (product) => {
    const response = await apiClient.post('/products', product);
    return response.data;
  },

  updateProduct: async (id, product) => {
    const response = await apiClient.patch(`/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  // ===== АУТЕНТИФИКАЦИЯ =====
  register: async (userData) => {
    const response = await apiClient.post(`/auth/register`, userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post(`/auth/login`, credentials);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  refresh: async (refreshToken) => {
    try {
      if (!refreshToken) {
        console.error('❌ Нет refresh-токена для отправки');
        throw new Error('No refresh token');
      }

      const response = await apiClient.post('/auth/refresh', {
        refreshToken: refreshToken
      });

      return response;
    } catch (error) {
      console.error('❌ Ошибка в refresh методе:');
      throw error;
    }
  },

  logout: async (refreshToken) => {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  getMe: async () => {
    const response = await apiClient.get(`/auth/me`);
    return response.data;
  },

  // ===== АДМИНКА (УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ) =====
  
  /**
   * Получить список всех пользователей (только для админа)
   */
  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  /**
   * Получить пользователя по ID (только для админа)
   */
  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Обновить пользователя (роль, статус) (только для админа)
   */
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Удалить пользователя (только для админа)
   */
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }
};