import axios from 'axios';
import { resolveApiBaseUrl } from './apiBaseUrl';

const api = axios.create({ baseURL: resolveApiBaseUrl() });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
