import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_PROVEEDORES_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getProveedores = async () => {
  const { data } = await api.get('/providers');
  return data;
};

export const asignarProveedor = async (eventoId, providerId) => {
  const payload = { eventId: eventoId, providerId };
  const { data } = await api.post('/event-providers', payload);
  return data;
};
