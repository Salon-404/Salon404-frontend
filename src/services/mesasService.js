import axios from 'axios'
import { services } from './endpointsUrl'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_MESAS_URL || services.mesas,
})

// Devuelve el layout global del salon con todas las mesas y sus posiciones
export async function getLayout() {
  const { data } = await api.get('/api/mesas/layout')
  return data
}

// Guarda el layout completo del salon (reemplaza todo)
export async function putLayout(layout) {
  const { data } = await api.put('/api/mesas/layout', layout)
  return data
}

// Elimina una mesa del plano. Devuelve 409 si tiene invitados asignados en reservas activas.
export async function deleteMesa(mesaId) {
  await api.delete(`/api/mesas/${mesaId}`)
}

// Devuelve el estado de asignaciones de invitados para una reserva especifica
export async function getAsignaciones(reservaId) {
  const { data } = await api.get(`/api/mesas/asignaciones/${reservaId}`)
  return data
}

// Asigna un invitado a una mesa. Devuelve 409 con CAPACIDAD_EXCEDIDA si esta llena.
export async function createAsignacion({ reservaId, mesaId, invitadoId }) {
  const { data } = await api.post('/api/mesas/asignaciones', { reservaId, mesaId, invitadoId })
  return data
}

// Quita la asignacion de un invitado a una mesa
export async function deleteAsignacion(asignacionId) {
  await api.delete(`/api/mesas/asignaciones/${asignacionId}`)
}

// Devuelve el layout con la ocupacion por mesa para la vista de solo lectura del cliente
export async function getPlano(reservaId) {
  const { data } = await api.get(`/api/mesas/plano/${reservaId}`)
  return data
}
