import axios from 'axios';

// Detectar automaticamente si estamos en 127.0.0.1 o localhost
const defaultHost = (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') 
  ? 'http://127.0.0.1:8000' 
  : 'http://localhost:8000';

let rawUrl = import.meta.env.VITE_API_URL || defaultHost;
const API_URL = rawUrl.replace(/\/+$/, '');

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT si existe
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;