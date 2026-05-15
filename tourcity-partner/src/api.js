import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  baseURL: isLocal 
    ? 'http://localhost:3001/api/partner' 
    : 'https://api.tourcity.info/api/partner'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('partner_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
