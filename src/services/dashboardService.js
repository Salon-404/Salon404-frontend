import axios from "axios";
import { services } from "./endpointsUrl";

const API_URL = services.dashboard;

export const dashboardService = {
  getMetrics: async (anio, salonId, tipoEventoId) => {
    try {
      const url = `${API_URL}/metrics?anio=${anio}&salonId=${salonId}&tipoEventoId=${tipoEventoId}`;

      const response = await axios.get(url);

      return response.data;
    } catch (error) {
      console.error("Error al obtener las métricas del dashboard:", error);
      throw error;
    }
  },
};
