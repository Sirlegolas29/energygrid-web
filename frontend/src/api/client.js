import axios from 'axios';

// Obtenemos la URL de la API y quitamos cualquier barra final (/) para evitar problemas de CORS por redirecciones (doble slash)
let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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