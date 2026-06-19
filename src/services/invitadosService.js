import axios from "axios";
import { services } from "./endpointsUrl";
const API_URL = services.invitados;
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImp0aSI6IjMzYjIyMWQwLTNhY2QtNDI3Ni04YmUzLWZkMzIxZDI5YmMwZCIsInJvbGUiOiJBZG1pbiIsIm5iZiI6MTc4MTgzNjQ2MywiZXhwIjoxNzgxODQwMDYzLCJpYXQiOjE3ODE4MzY0NjMsImlzcyI6IlNhbG9uNDA0LUF1dGgiLCJhdWQiOiJTYWxvbjQwNC1DbGllbnRzIn0.8xxawSt3m8ArHyv3bWfdvIz47fB88AvvoeuUiFo2nMU";

export const invitadosService = {
  // OBTENER TODOS LOS INVITADOS
  // Endpoint: GET /api/v1/events/{eventId}/Guests
  getAll: async (eventId, page, pageSize) => {
    try {
      const response = await axios.get(
        `${API_URL}/${eventId}/Guests?page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // <-- Clave para pasar el JWT
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error al obtener invitados:", error);
      throw error;
    }
  },

  // CREAR UN INVITADO
  // Endpoint: POST /api/v1/events/{eventId}/Guests
  create: async (eventId, invitadoData) => {
    try {
      const payload = {
        fullName: invitadoData.fullName,
        phone: invitadoData.phone || "",
        email: invitadoData.email || "",
        dietTypeId: parseInt(invitadoData.dietTypeId),
        tableId:null,
      };

      const response = await axios.post(
        `${API_URL}/${eventId}/Guests`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear invitado:", error);
      throw error;
    }
  },

  // ELIMINAR INVITADO
  // Endpoint: DELETE /api/v1/events/{eventId}/Guests/{guestId}
  delete: async (eventId, guestId) => {
    try {
      await axios.delete(
        `${API_URL}/${eventId}/Guests/${guestId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return true;
    } catch (error) {
      console.error("Error al eliminar invitado:", error);
      throw error;
    }
  },

  // RESUMEN DE CATERING
  // Endpoint: GET /api/v1/events/{eventId}/Guests/catering-summary
  getCateringSummary: async (eventId) => {
    try {
      const response = await axios.get(
        `${API_URL}/${eventId}/Guests/catering-summary`,
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener resumen de catering:", error);
      throw error;
    }
  },

  // ACTUALIZAR INVITADO (PUT)
  update: async (eventId, guestId, payload) => {
    try {
      // Al ser una ruta pública accedida por el invitado, no le pasamos token de Bearer
      const response = await axios.put(
        `${API_URL}/${eventId}/Guests/${guestId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      console.error("Error en update invitado:", error);
      throw error;
    }
  },

  getById: async (eventId, guestId) => {
    try {
      // Al ser una vista pública para el invitado, no enviamos token de Authorization
      const response = await axios.get(
        `${API_URL}/${eventId}/Guests/${guestId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data; // Tu backend debería retornar el objeto del invitado
    } catch (error) {
      console.error("Error en getById de invitado:", error);
      throw error;
    }
  },

  // GENERAR TICKET (POST)
  generarTicket: async (eventId, guestId) => {
    try {
      const response = await axios.post(
        `${API_URL}/${eventId}/Guests/${guestId}/ticket`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data; // Retorna el objeto con el qrCodeToken
    } catch (error) {
      console.error("Error al generar el ticket:", error);
      throw error;
    }
  },

  // OBTENER TICKET (GET)
  getTicket: async (eventId, guestId) => {
    try {
      const response = await axios.get(
        `${API_URL}/${eventId}/Guests/${guestId}/ticket`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener el ticket:", error);
      throw error;
    }
  },
};
