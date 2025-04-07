import axios from "axios";

const API_BASE_URL = 'http://localhost:5000'; //uncomment for prod

export const apiFetch = async (endpoint, method = 'GET', body = null, customHeaders = {}) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Ошибка при выполнении запроса');
  }

  return response.json();
};
