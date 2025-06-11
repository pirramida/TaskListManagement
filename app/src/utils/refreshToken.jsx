import axios from "axios";
import { addToast } from './addToast.jsx'

const BASE_URL = 'https://localhost:5000';

/**
 * Функция для обновления токена
 * 
 * @param {function} navigate - Функция для перехода на другую страницу
 * 
 * @returns {Promise<string | null>} - Promise, который выполняется с новым токеном
 *                                     или null, если обновление токена не удалось
 */
export const refreshToken = async (navigate) => {
  try {
    // Отправляем запрос на обновление токена
    const response = await axios.post('https://localhost:5000/auth/refresh-token', null, { withCredentials: true });

    // Если запрос выполнен успешно, возвращаем новый токен
    return response.data.accessToken;
  } catch (error) {
    addToast('connectionLost', 'error', 'Ошибка соединения с сервером...!', 1000)
  }
};

export const fetchWithRetry = async (halfUrl, method, data, navigate, options = {}) => {
  const url = `${BASE_URL.replace(/\/$/, '')}/${halfUrl.replace(/^\//, '')}`;

  try {
    // Выполняем запрос
    const response = await axios({ method, url, data, withCredentials: true, ...options });

    // Если запрос выполнен успешно, возвращаем ответ сервера
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const tokenRefreshed = await refreshToken(navigate);

      if (tokenRefreshed) {
        const response = await axios({ method, url, data, withCredentials: true, ...options });
        return response.data;
      }

      localStorage.setItem('isLoggedIn', false)
      addToast('unauthorized', 'error', 'Войдите в аккаунт!', 1000)
      navigate("/");
      throw new Error('Token refresh failed');
    } else if (error.code === "ERR_NETWORK") {
      addToast('connectionLost', 'error', 'Ошибка соединения с сервером...!', 1000)
      localStorage.setItem('isLoggedIn', false)
      navigate("/");
      throw new Error('Connection lost');
    } else {
      throw error;
    }
  }
};
