import React, { useEffect, useState } from 'react';
import { fetchWithRetry } from '../utils/refreshToken';

const CLIENT_ID = "362002328679-n4uqn1arfofigtuur8po169gds8lrh76.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

export default function GoogleCalendarOAuth() {
  const [token, setToken] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (window.google) {
        window.codeClient = window.google.accounts.oauth2.initCodeClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          ux_mode: 'popup',
          prompt: 'consent',
          callback: handleCallbackResponse,
        });
      } else {
        console.error("Google Identity Services not loaded");
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleCallbackResponse = async (response) => {
    const { code } = response;
    try {
      // Отправка authorization_code на сервер для обмена на токены
      const tokenData = await fetchWithRetry('/users/refresh', 'POST', { code });
      const { access_token, refresh_token, expires_in } = tokenData;

      setToken(access_token);

      // Получаем email пользователя
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const userInfo = await userInfoRes.json();

      // Сохраняем всё в БД
      await fetchWithRetry('/users', 'PATCH', {
        userdata: {
          email: userInfo.email,
          access_token,
          refresh_token,
          expires_in,
        },
        action: 'save'
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = () => {
    setLoading(true);
    if (window.codeClient) {
      window.codeClient.requestCode();
    } else {
      setError("Google client not initialized");
      setLoading(false);
    }
  };

  const handleEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithRetry('/users/googleEvents', "GET");

      if (!res.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await res.json();
      setEvents([...data.todayEvents, ...data.tomorrowEvents]);
    } catch (err) {
      setError(err.message || 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    try {
      setLoading(true);
      await fetchWithRetry('/users', 'PATCH', {
        userdata: {},
        action: 'delete'
      });
      setToken(null);
      setEvents([]);
    } catch (err) {
      setError(err.message || 'Не удалось отвязать Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleAuth} disabled={loading}>
        {loading ? 'Авторизация...' : 'Привязать Google'}
      </button>
      <button onClick={handleEvents}>
        {loading ? 'Загружаем события...' : 'Получить события'}
      </button>
      <button onClick={handleUnlink} disabled={loading}>
        {loading ? 'Отвязываем...' : 'Отвязать Google'}
      </button>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <ul>
        {events.map((event, idx) => (
          <li key={idx}>
            {event.summary} ({event.start})
          </li>
        ))}
      </ul>
    </div>
  );
}
