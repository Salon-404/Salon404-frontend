import axios from 'axios';

const API_URL = import.meta.env.VITE_API_INVITADOS_URL || 'http://localhost:5002';
const EVENT_ID_MOCK = '00000000-0000-0000-0000-000000000001'; 

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const invitadosService = {
  getInvitados: async (page = 1, pageSize = 100, searchTerm = '') => {
    const response = await api.get(`/api/v1/events/${EVENT_ID_MOCK}/Guests`, { params: { page, pageSize, searchTerm } });
    return response.data; 
  },
  crearInvitado: async (data) => {
    const response = await api.post(`/api/v1/events/${EVENT_ID_MOCK}/Guests`, data);
    return response.data;
  },
  actualizarInvitado: async (id, data) => {
    const response = await api.put(`/api/v1/events/${EVENT_ID_MOCK}/Guests/${id}`, data);
    return response.data;
  },
  eliminarInvitado: async (id) => {
    const response = await api.delete(`/api/v1/events/${EVENT_ID_MOCK}/Guests/${id}`);
    return response.data;
  },
  getCateringSummary: async () => {
    const response = await api.get(`/api/v1/events/${EVENT_ID_MOCK}/Guests/catering-summary`);
    return response.data;
  },
  getMesas: async () => {
    const response = await api.get(`/api/v1/events/${EVENT_ID_MOCK}/Tables`);
    return response.data;
  },
  getDietTypes: async () => {
    const response = await api.get('/api/v1/diet-types');
    return response.data;
  }
};
