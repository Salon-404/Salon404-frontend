import axios from 'axios'
import { services } from './endpointsUrl'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_EVENT_TYPES_URL || services.eventTypes,
})

// Devuelve todos los tipos de evento activos
export async function getTipos() {
  const { data } = await api.get('')
  return data
}

// Devuelve un tipo de evento por id
export async function getTipoById(id) {
  const { data } = await api.get(`/${id}`)
  return data
}

// Crea un nuevo tipo de evento
export async function crearTipo(data) {
  const { data: created } = await api.post('', data)
  return created
}

// Actualiza un tipo de evento existente
export async function actualizarTipo(id, data) {
  const { data: updated } = await api.put(`/${id}`, data)
  return updated
}

// Elimina un tipo de evento
export async function eliminarTipo(id) {
  await api.delete(`/${id}`)
}
