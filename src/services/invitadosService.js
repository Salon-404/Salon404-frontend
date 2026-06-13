import axios from 'axios';

const API_URL = import.meta.env.VITE_API_INVITADOS_URL;

export const invitadosService = {
  
  // OBTENER TODOS LOS INVITADOS
  // Endpoint: GET /api/v1/events/{eventId}/Guests
  getAll: async (eventId) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/events/${eventId}/Guests`);
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
        dietTypeId: parseInt(invitadoData.dietTypeId)
      };
      
      const response = await axios.post(`${API_URL}/api/v1/events/${eventId}/Guests`, payload);
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
      await axios.delete(`${API_URL}/api/v1/events/${eventId}/Guests/${guestId}`);
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
      const response = await axios.get(`${API_URL}/api/v1/events/${eventId}/Guests/catering-summary`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener resumen de catering:", error);
      throw error;
    }
  },

  // ACTUALIZAR INVITADO (PUT)
  update: async (eventId, guestId, invitadoData) => {
    console.warn("ATENCIÓN: El endpoint PUT está comentado en el backend. Simulando respuesta...");
    
    const payload = {
      fullName: invitadoData.fullName,
      phone: invitadoData.phone,
      email: invitadoData.email,
      dietTypeId: parseInt(invitadoData.dietTypeId)
    };

    /* // DESCOMENTAR ESTO CUANDO EL BACKEND ESTÉ LISTO:
    const response = await axios.put(`${API_URL}/api/v1/events/${eventId}/Guests/${guestId}`, payload);
    return response.data;
    */

    // Retorno temporal para que tu front no se rompa mientras prueban
    return { ...payload, id: guestId };
  }
};