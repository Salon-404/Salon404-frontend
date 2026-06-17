import axios from 'axios';
import { services } from './endpointsUrl';
const api = axios.create({
  baseURL: services.eventos,
})

/**
 * Devuelve todos los eventos, con filtros opcionales.
 */
export async function getEventos(filtros = {}, signal) {
  const { data } = await api.get("",{
    params: filtros,
    signal,
  })
  return data;
}

/**
 * Devuelve un evento por id.
 */
export async function getEvento(id) {
  const { data } = await api.get(id)
  return data
}

/**
 * Devuelve el evento asociado a una reserva.
 */
export async function getEventoPorReservaId(reservaId) {
  const { data } = await api.get(`${reservaId}`
  )

  return data
}

/**
 * Crea un nuevo evento.
 */
export async function createEvento(evento) {
  const { data } = await api.post('/api/v1/events', evento)
  return data
}

/**
 * Actualiza un evento existente.
 */
export async function updateEvento(id, evento) {
  const { data } = await api.put(
    `/api/v1/events/${id}`,
    evento
  )

  return data
}

/**
 * Cambia el estado del evento.
 */
export async function updateEstadoEvento(
  id,
  estado,
  version
) {
  const { data } = await api.patch(
    `/api/v1/events/${id}/status`,
    {
      estado,
      version,
    }
  )

  return data
}

/**
 * Cambia el estado de la reserva.
 */
export async function updateEstadoReserva(
  id,
  estado,
  version
) {
  const { data } = await api.patch(
    `/api/v1/events/${id}/reservation/status`,
    {
      estado,
      version,
    }
  )

  return data
}

/**
 * Bloquea temporalmente un horario.
 */
export async function bloquearHorario(datos) {
  const { data } = await api.post(
    '/api/v1/events/lock',
    datos
  )

  return data
}

/**
 * Libera un horario bloqueado.
 */
export async function liberarHorario(reservaId) {
  const { data } = await api.delete(
    `/api/v1/events/lock/${reservaId}`
  )

  return data
}

/**
 * Devuelve la disponibilidad de una fecha.
 */
export async function getDisponibilidad(fecha) {
  const { data } = await api.get(
    '/api/v1/events/availability',
    {
      params: { fecha },
    }
  )

  return data
}