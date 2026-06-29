import axios from 'axios'
import { services } from './endpointsUrl'
import { TIPOS_EVENTO_FALLBACK } from '../constants/tiposEvento'

const configuredUrl = import.meta.env.VITE_API_EVENT_TYPES_URL || services.eventTypes

function getCandidateUrls() {
  const baseUrl = services.eventos.replace(/\/events\/?$/i, '')
  return [
    configuredUrl,
    `${baseUrl}/EventType`,
    `${baseUrl}/eventtypes`,
    `${baseUrl}/event-types`,
    `${services.eventos}/types`,
  ].filter((url, index, urls) => url && urls.indexOf(url) === index)
}

function unwrapList(responseData) {
  if (Array.isArray(responseData)) return responseData
  if (Array.isArray(responseData?.data)) return responseData.data
  if (Array.isArray(responseData?.items)) return responseData.items
  if (Array.isArray(responseData?.result)) return responseData.result
  if (Array.isArray(responseData?.results)) return responseData.results
  if (Array.isArray(responseData?.value)) return responseData.value
  return []
}


// Devuelve un tipo de evento por id
export async function getTipoById(id) {
  const { data } = await axios.get(`${configuredUrl}/${id}`)
  return normalizeTipo(data)
}

// Crea un nuevo tipo de evento
export async function crearTipo(data) {
  const { data: created } = await axios.post(configuredUrl, data)
  return created
}

// Actualiza un tipo de evento existente
export async function actualizarTipo(id, data) {
  const { data: updated } = await axios.put(`${configuredUrl}/${id}`, data)
  return updated
}

// Elimina un tipo de evento
export async function eliminarTipo(id) {
  await axios.delete(`${configuredUrl}/${id}`)
}
