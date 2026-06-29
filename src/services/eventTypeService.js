import axios from "axios";
import { services } from "./endpointsUrl";
import { TIPOS_EVENTO_FALLBACK } from "../constants/tiposEvento";

function unwrapList(responseData) {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.result)) return responseData.result;
  if (Array.isArray(responseData?.results)) return responseData.results;
  if (Array.isArray(responseData?.value)) return responseData.value;
  return [];
}

function normalizeTipo(tipo) {
  return {
    ...tipo,
    id: tipo.id ?? tipo.eventTypeId,
    nombre: tipo.nombre ?? tipo.name,
    precioBase: tipo.precioBase ?? tipo.price,
    duracionMinutos: tipo.duracionMinutos ?? tipo.duration,
    duracionMaximaMinutos: tipo.duracionMaximaMinutos ?? tipo.duration,
    activo: tipo.activo ?? tipo.active ?? true,
  };
}

function getCandidateUrls() {
  const baseUrl = services.eventos.replace(/\/events\/?$/i, "");
  return [
    services.eventTypes,
    `${baseUrl}/EventType`,
    `${baseUrl}/eventtypes`,
    `${baseUrl}/event-types`,
    `${services.eventos}/types`,
  ].filter((url, index, urls) => url && urls.indexOf(url) === index);
}

export async function getAllTypes() {
  let lastError;

  for (const url of getCandidateUrls()) {
    try {
      const response = await axios.get(url);
      const tipos = unwrapList(response.data).map(normalizeTipo);
      return tipos.length ? tipos : TIPOS_EVENTO_FALLBACK;
    } catch (error) {
      lastError = error;
      if (error.response?.status !== 404) break;
    }
  }

  if (lastError?.response?.status === 404) return TIPOS_EVENTO_FALLBACK;

  throw new Error(
    lastError?.response?.data?.details ||
      lastError?.response?.data?.message ||
      lastError?.message ||
      "No se pudo conectar con el servidor",
  );
}

export async function getAllTypesBySalonId(salonId) {
  let lastError;

  for (const url of getCandidateUrls()) {
    try {
      // Nos aseguramos de que no queden barras dobles al concatenar el path parameter
      const limpiaUrl = url.endsWith("/") ? url : `${url}/`;
      const urlConParametro = `${limpiaUrl}${salonId}`;

      // Hacemos la petición con el ID directamente incrustado en la URL
      const response = await axios.get(urlConParametro);
      return unwrapList(response.data).map(normalizeTipo);
    } catch (error) {
      lastError = error;
      if (error.response?.status !== 404) break;
    }
  }

  if (lastError?.response?.status === 404) return [];

  throw new Error(
    lastError?.response?.data?.details ||
      lastError?.response?.data?.message ||
      lastError?.message ||
      "No se pudo conectar con el servidor",
  );
}
export async function createEventTypeBySalon(datos) {
  let lastError;

  for (const url of getCandidateUrls()) {
    try {
      // Pasamos 'datos' como segundo argumento para enviar el JSON en el cuerpo del POST
      const response = await axios.post(url, datos);
      const tipos = unwrapList(response.data).map(normalizeTipo);
      return tipos.length ? tipos : TIPOS_EVENTO_FALLBACK;
    } catch (error) {
      lastError = error;
      if (error.response?.status !== 404) break;
    }
  }

  if (lastError?.response?.status === 404) return TIPOS_EVENTO_FALLBACK;

  throw new Error(
    lastError?.response?.data?.details ||
      lastError?.response?.data?.message ||
      lastError?.message ||
      "No se pudo conectar con el servidor",
  );
}
