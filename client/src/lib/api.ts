import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV 
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : 'https://hyperlocal-09.onrender.com/api');

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

export default api;
