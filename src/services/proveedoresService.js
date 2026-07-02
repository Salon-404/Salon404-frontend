import axios from "axios";
import { services } from "./endpointsUrl";

const urlBase = services.proveedores;

export const obtenerProveedores = (
  pagina = 1,
  porPagina = 10,
  providerType = "",
) =>
  axios.get(urlBase, {
    params: { page: pagina, pageSize: porPagina, providerTypeId: providerType },
  });

export const obtenerProveedorPorId = (id) => axios.get(`${urlBase}/${id}`);

export const crearProveedor = (datos) => axios.post(urlBase, datos);

export const actualizarProveedor = (id, datos) =>
  axios.put(`${urlBase}/${id}`, datos);

export const eliminarProveedor = (id) => axios.delete(`${urlBase}/${id}`);


export async function getProvidersBySalonId(salonId) {
  try
  {
    const result = axios.get(`${urlBase}/salon/${salonId}`);
    return result;
  }  
  catch (error) {
        throw new Error(getApiErrorMessage(error));
  }  
}

export const obtenerSugerenciasCatering = (eventId) => {
  return axios.get(`${urlBase}/catering-suggestions/${eventId}`);
};

export const obtenerSeleccionCatering = (eventId) => {
  return axios.get(`${urlBase}/catering/seleccion/${eventId}`);
};

export const guardarSeleccionCatering = (eventId, providerId) => {
  return axios.post(`${urlBase}/catering/seleccion`, { eventId,providerId  });
};
