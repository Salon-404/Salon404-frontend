import axios from "axios";
import { services } from "./endpointsUrl";
import { TOKEN_KEY } from "../constants/auth";

const API_URL = services.invitados;

// Header de autenticación con el token del usuario logueado (mismo patrón que eventosService).
// Si no hay sesión, no se envía Authorization: nunca se usa un token hardcodeado.
function authHeader() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const invitadosService = {
  // OBTENER TODOS LOS INVITADOS
  // Endpoint: GET /api/v1/events/{eventId}/Guests
  getAll: async (eventId, page, pageSize, searchTerm = "") => {
    try {
      // Construimos la URL base con los parámetros obligatorios
      let url = `${API_URL}/${eventId}/Guests?page=${page}&pageSize=${pageSize}`;

      // Si viene un término de búsqueda, lo agregamos codificado a la URL
      if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
      }

      const response = await axios.get(url, { headers: authHeader() });

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
        tableId: null,
      };

      const response = await axios.post(
        `${API_URL}/${eventId}/Guests`,
        payload,
        { headers: authHeader() },
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
      await axios.delete(`${API_URL}/${eventId}/Guests/${guestId}`, {
        headers: authHeader(),
      });
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
        { headers: authHeader() },
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener resumen de catering:", error);
      throw error;
    }
  },

  // ACTUALIZAR INVITADO (PUT)
  // Endpoint: PUT /api/v1/events/{eventId}/Guests/{guestId}
  update: async (eventId, guestId, payload) => {
    try {
      const response = await axios.put(
        `${API_URL}/${eventId}/Guests/${guestId}`,
        payload,
        { headers: authHeader() },
      );
      return response.data;
    } catch (error) {
      console.error("Error en update invitado:", error);
      throw error;
    }
  },

  // OBTENER INVITADO POR ID (autenticado)
  // Endpoint: GET /api/v1/events/{eventId}/Guests/{guestId}
  getById: async (eventId, guestId) => {
    try {
      const response = await axios.get(
        `${API_URL}/${eventId}/Guests/${guestId}`,
        { headers: authHeader() },
      );
      return response.data;
    } catch (error) {
      console.error("Error en getById de invitado:", error);
      throw error;
    }
  },

  // GENERAR TICKET (POST)
  // Endpoint: POST /api/v1/events/{eventId}/Guests/{guestId}/ticket
  generarTicket: async (eventId, guestId) => {
    try {
      const response = await axios.post(
        `${API_URL}/${eventId}/Guests/${guestId}/ticket`,
        {},
        { headers: authHeader() },
      );
      return response.data; // Retorna el objeto con el qrCodeToken
    } catch (error) {
      console.error("Error al generar el ticket:", error);
      throw error;
    }
  },

  // OBTENER TICKET (GET)
  // Endpoint: GET /api/v1/events/{eventId}/Guests/{guestId}/ticket
  getTicket: async (eventId, guestId) => {
    try {
      const response = await axios.get(
        `${API_URL}/${eventId}/Guests/${guestId}/ticket`,
        { headers: authHeader() },
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener el ticket:", error);
      throw error;
    }
  },

  // OBTENER INVITADO POR TOKEN (PÚBLICO / [AllowAnonymous])
  // Endpoint: GET /api/v1/guests/by-token/{token}
  getByToken: async (token) => {
    try {
      const baseUrl = API_URL.replace(/\/events\/?$/, "/guests");
      const response = await axios.get(`${baseUrl}/by-token/${token}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener invitado por token:", error);
      throw error;
    }
  },

  // ACTUALIZAR INVITADO POR TOKEN (PÚBLICO / [AllowAnonymous])
  // Endpoint: PUT /api/v1/guests/by-token/{token}
  updateByToken: async (token, payload) => {
    try {
      const baseUrl = API_URL.replace(/\/events\/?$/, "/guests");
      const response = await axios.put(`${baseUrl}/by-token/${token}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar invitado por token:", error);
      throw error;
    }
  },

  // OBTENER DATOS DEL TICKET POR QR (check-in autenticado: admin/responsable)
  // Endpoint: GET /api/v1/events/{eventId}/Tickets/{token}
  getByTicket: async (eventId, token) => {
    try {
      const response = await axios.get(
        `${API_URL}/${eventId}/Tickets/${token}`,
        { headers: authHeader() },
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener los datos del invitado:", error);
      // Re-lanzamos el error original para preservar response.status (401/403/404…).
      throw error;
    }
  },

  // REGISTRAR INGRESO / ESCANEAR TICKET (check-in autenticado: admin/responsable)
  // Endpoint: PUT /api/v1/events/{eventId}/Tickets/{token}/scan
  updateTicketStatus: async (eventId, ticket) => {
    try {
      const response = await axios.put(
        `${API_URL}/${eventId}/Tickets/${ticket}/scan`,
        null,
        { headers: authHeader() },
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el ticket:", error);
      // Re-lanzamos el error original para preservar response.status (401/403/409…).
      throw error;
    }
  },
};
