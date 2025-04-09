import axios from "axios";
import { addToast } from './addToast.jsx'

const BASE_URL = 'http://localhost:5000';


export const fetchWithRetry = async (halfUrl, method, data, navigate, options = {}) => {
  const url = `${BASE_URL.replace(/\/$/, '')}/${halfUrl.replace(/^\//, '')}`;

  try {
    const response = await axios({ method, url, data, withCredentials: true, ...options });
    return response.data;
  } catch (error) {
    addToast('connectionLost', 'error', 'Ошибка соединения с сервером...!', 1000 )
    throw error;
  }
};
