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

function normalizeTipo(tipo) {
  return {
    ...tipo,
    id: tipo.id ?? tipo.eventTypeId,
    nombre: tipo.nombre ?? tipo.name,
    precioBase: tipo.precioBase ?? tipo.price,
    duracionMinutos: tipo.duracionMinutos ?? tipo.duration,
    duracionMaximaMinutos: tipo.duracionMaximaMinutos ?? tipo.duration,
    activo: tipo.activo ?? tipo.active ?? true,
  }
}

// Devuelve todos los tipos de evento activos
export async function getTipos() {
  let lastError

  for (const url of getCandidateUrls()) {
    try {
      const { data } = await axios.get(url)
      const tipos = unwrapList(data).map(normalizeTipo)
      return tipos.length ? tipos : TIPOS_EVENTO_FALLBACK
    } catch (error) {
      lastError = error
      if (error.response?.status !== 404) break
    }
  }

  if (lastError?.response?.status === 404) return TIPOS_EVENTO_FALLBACK
  throw lastError
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
