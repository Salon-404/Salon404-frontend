import axios from "axios";
import { services } from "./endpointsUrl";

const urlBase = services.eventProviders || "http://localhost:5114/api/v1/event-providers";

export const asignarProveedorAActividad = (eventScheduleId, providerId) => {
  return axios.post(urlBase, { eventScheduleId, providerId });
};

export const desasignarProveedorDeActividad = (assignmentId) => {
  return axios.delete(`${urlBase}/${assignmentId}`);
};

export const obtenerProveedoresDeActividad = (eventScheduleId) => {
  return axios.get(`${urlBase}/schedule/${eventScheduleId}`);
};
