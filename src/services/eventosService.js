import axios from 'axios'
import { eventosMock } from '../mocks/eventosMock'
import { services } from './endpointsUrl'

const USE_MOCK = true

const api = axios.create({
  baseURL: services.eventos,
})

let eventosState = JSON.parse(JSON.stringify(eventosMock))
let nextMockId = 1000

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
function nextId(prefix) {
  return `${prefix}-mock-${nextMockId++}`
}
function createNotFoundError() {
  const error = new Error('Evento no encontrado')
  error.response = { status: 404 }
  return error
}
function createConflictError(message) {
  const error = new Error(message)
  error.response = { status: 409 }
  return error
}
function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

export async function getEventos(filtros = {}, signal) {
  if (USE_MOCK) {
    await delay()
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    let data = [...eventosState]
    if (filtros.estado) data = data.filter((e) => e.estado === filtros.estado)
    if (filtros.tipoEventoId) data = data.filter((e) => e.tipoEventoId === Number(filtros.tipoEventoId))
    if (filtros.fechaDesde) data = data.filter((e) => e.fecha >= filtros.fechaDesde)
    if (filtros.fechaHasta) data = data.filter((e) => e.fecha <= filtros.fechaHasta)
    if (filtros.eventOwner) data = data.filter((e) => e.eventOwner === filtros.eventOwner)
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase()
      data = data.filter(
        (e) =>
          e.nombre.toLowerCase().includes(q) ||
          e.cliente.nombre.toLowerCase().includes(q) ||
          e.cliente.email.toLowerCase().includes(q)
      )
    }
    return clone(data)
  }
  const { data } = await api.get('/api/v1/events', { params: filtros, signal })
  return data
}

export async function getEvento(id) {
  const { data } = await api.get(id)
  return data
}

export async function getEventoPorReservaId(reservaId) {
  const { data } = await api.get(`${reservaId}`)
  return data
}

export async function createEvento(data) {
  if (USE_MOCK) {
    await delay(300)
    const nuevo = {
      ...data,
      id: nextId('evt'),
      version: 1,
      estado: data.estado || 'pendiente',
      reserva: {
        ...data.reserva,
        id: nextId('res'),
        creadoEn: new Date().toISOString(),
      },
    }
    eventosState.push(nuevo)
    return clone(nuevo)
  }
  const { data: created } = await api.post('/api/v1/events', data)
  return created
}

export async function updateEvento(id, data, version) {
  if (USE_MOCK) {
    await delay(300)
    const idx = eventosState.findIndex((e) => e.id === id)
    if (idx === -1) throw createNotFoundError()
    if (eventosState[idx].version !== version) {
      throw createConflictError('Este evento fue modificado, recargá la página')
    }
    eventosState[idx] = { ...eventosState[idx], ...data, version: version + 1 }
    return clone(eventosState[idx])
  }
  const { data: updated } = await api.put(`/api/v1/events/${id}`, { ...data, version })
  return updated
}

export async function updateEstadoEvento(id, estado, version) {
  const { data } = await api.patch(`/api/v1/events/${id}/status`, { estado, version })
  return data
}

export async function updateEstadoReserva(id, estado, version) {
  const { data } = await api.patch(`/api/v1/events/${id}/reservation/status`, { estado, version })
  return data
}

export async function bloquearHorario(datos) {
  const { data } = await api.post('/api/v1/events/lock', datos)
  return data
}

export async function liberarHorario(reservaId) {
  const { data } = await api.delete(`/api/v1/events/lock/${reservaId}`)
  return data
}

export async function getDisponibilidad(fecha) {
  if (USE_MOCK) {
    await delay()
    const eventos = eventosState.filter((e) => e.fecha === fecha && e.estado !== 'cancelado')
    return { eventos: clone(eventos) }
  }
  const { data } = await api.get('/api/v1/events/availability', { params: { fecha } })
  return data
}