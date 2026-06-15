import axios from 'axios'
import { eventosMock } from '../mocks/eventosMock'
<<<<<<< HEAD

// Poner en false cuando el backend de eventos esté listo
=======
import { tiposEventoMock } from '../mocks/tiposEventoMock'
import { sumarMinutos } from '../constants/eventos'

// Poner en false cuando el backend de David esté listo
>>>>>>> origin/develop
const USE_MOCK = true

const api = axios.create({
  baseURL: import.meta.env.VITE_API_EVENTOS_URL,
})

// Copia local para simular persistencia durante la sesión
let eventosState = JSON.parse(JSON.stringify(eventosMock))
<<<<<<< HEAD
let nextMockId = 1000
=======

let _nextId = 1000
function nextId() { return `evt-mock-${_nextId++}` }
>>>>>>> origin/develop

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

<<<<<<< HEAD
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
=======
// Convierte 'HH:mm' a minutos desde medianoche
function toMinutos(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
>>>>>>> origin/develop
}

/**
 * Devuelve todos los eventos, con filtros opcionales.
<<<<<<< HEAD
 * @param {{ estado?: string, tipoEventoId?: number, fechaDesde?: string, fechaHasta?: string, eventOwner?: string, busqueda?: string }} filtros
 * @returns {Promise<Array>} eventos
 */
export async function getEventos(filtros = {}, signal) {
  if (USE_MOCK) {
    await delay()
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    let data = [...eventosState]

    if (filtros.estado) {
      data = data.filter((e) => e.estado === filtros.estado)
    }
    if (filtros.tipoEventoId) {
      data = data.filter((e) => e.tipoEventoId === Number(filtros.tipoEventoId))
    }
    if (filtros.fechaDesde) {
      data = data.filter((e) => e.fecha >= filtros.fechaDesde)
    }
    if (filtros.fechaHasta) {
      data = data.filter((e) => e.fecha <= filtros.fechaHasta)
    }
    if (filtros.eventOwner) {
      data = data.filter((e) => e.eventOwner === filtros.eventOwner)
    }
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
=======
 * @param {{ estado?: string, tipoEventoId?: number, fechaDesde?: string, fechaHasta?: string }} filtros
 */
export async function getEventos(filtros = {}) {
  if (USE_MOCK) {
    await delay()
    let data = [...eventosState]
    if (filtros.estado) data = data.filter((e) => e.estado === filtros.estado)
    if (filtros.tipoEventoId) data = data.filter((e) => e.tipoEventoId === Number(filtros.tipoEventoId))
    if (filtros.fechaDesde) data = data.filter((e) => e.fecha >= filtros.fechaDesde)
    if (filtros.fechaHasta) data = data.filter((e) => e.fecha <= filtros.fechaHasta)
    return JSON.parse(JSON.stringify(data))
  }
  const { data } = await api.get('/api/v1/events', { params: filtros })
>>>>>>> origin/develop
  return data
}

/**
<<<<<<< HEAD
 * Devuelve un evento por id.
 * @param {string} id
 * @returns {Promise<Object>} evento
 */
export async function getEvento(id) {
  if (USE_MOCK) {
    await delay()
    const evento = eventosState.find((e) => e.id === id)
    if (!evento) throw createNotFoundError()
    return clone(evento)
  }

=======
 * Devuelve un evento por id o null si no existe.
 * @param {string} id
 */
export async function getEventoById(id) {
  if (USE_MOCK) {
    await delay()
    const evento = eventosState.find((e) => e.id === id)
    if (!evento) return null
    return JSON.parse(JSON.stringify(evento))
  }
>>>>>>> origin/develop
  const { data } = await api.get(`/api/v1/events/${id}`)
  return data
}

/**
<<<<<<< HEAD
 * Devuelve el evento asociado a una reserva por su id de reserva.
 * Útil para módulos que aún operan con el identificador legacy de reserva (mesas).
 * @param {string} reservaId
 * @returns {Promise<Object>} evento
 */
export async function getEventoPorReservaId(reservaId) {
  if (USE_MOCK) {
    await delay()
    const evento = eventosState.find((e) => e.reserva?.id === reservaId)
    if (!evento) throw createNotFoundError()
    return clone(evento)
  }

  const { data } = await api.get(`/api/v1/events/by-reservation/${reservaId}`)
=======
 * Devuelve todos los eventos cuya fecha coincida con la indicada.
 * @param {string} fecha - Fecha en formato 'YYYY-MM-DD'
 */
export async function getEventosPorDia(fecha) {
  if (USE_MOCK) {
    await delay()
    const data = eventosState.filter((e) => e.fecha === fecha)
    return JSON.parse(JSON.stringify(data))
  }
  const { data } = await api.get('/api/v1/events', { params: { fecha } })
>>>>>>> origin/develop
  return data
}

/**
<<<<<<< HEAD
 * Crea un nuevo evento con reserva embebida.
 * @param {Object} data
 * @returns {Promise<Object>} evento creado
 */
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

=======
 * Crea un nuevo evento.
 * @param {object} data
 */
export async function crearEvento(data) {
  if (USE_MOCK) {
    await delay(300)
    const nuevo = {
      ...data,
      id: nextId(),
      reserva: {
        ...data.reserva,
        id: `res-mock-${_nextId}`,
        creadoEn: new Date().toISOString(),
      },
    }
    eventosState.push(nuevo)
    return JSON.parse(JSON.stringify(nuevo))
  }
>>>>>>> origin/develop
  const { data: created } = await api.post('/api/v1/events', data)
  return created
}

/**
<<<<<<< HEAD
 * Actualiza un evento existente con optimistic locking.
 * @param {string} id
 * @param {Object} data
 * @param {number} version
 * @returns {Promise<Object>} evento actualizado
 */
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
=======
 * Actualiza un evento existente.
 * @param {string} id
 * @param {object} data
 */
export async function actualizarEvento(id, data) {
  if (USE_MOCK) {
    await delay(300)
    const idx = eventosState.findIndex((e) => e.id === id)
    if (idx === -1) {
      const error = new Error('Evento no encontrado')
      error.response = { status: 404 }
      throw error
    }
    eventosState[idx] = { ...eventosState[idx], ...data }
    return JSON.parse(JSON.stringify(eventosState[idx]))
  }
  const { data: updated } = await api.put(`/api/v1/events/${id}`, data)
>>>>>>> origin/develop
  return updated
}

/**
<<<<<<< HEAD
 * Cambia el estado del evento.
 * @param {string} id
 * @param {string} estado
 * @param {number} version
 * @returns {Promise<Object>} evento actualizado
 */
export async function updateEstadoEvento(id, estado, version) {
  if (USE_MOCK) {
    await delay(300)

    const idx = eventosState.findIndex((e) => e.id === id)
    if (idx === -1) throw createNotFoundError()
    if (eventosState[idx].version !== version) {
      throw createConflictError('Este evento fue modificado, recargá la página')
    }

    eventosState[idx] = { ...eventosState[idx], estado, version: version + 1 }
    return clone(eventosState[idx])
  }

  const { data: updated } = await api.patch(`/api/v1/events/${id}/status`, { estado, version })
  return updated
}

/**
 * Cambia el estado de la reserva embebida.
 * @param {string} id
 * @param {string} estado
 * @param {number} version
 * @returns {Promise<Object>} evento actualizado
 */
export async function updateEstadoReserva(id, estado, version) {
  if (USE_MOCK) {
    await delay(300)

    const idx = eventosState.findIndex((e) => e.id === id)
    if (idx === -1) throw createNotFoundError()
    if (eventosState[idx].version !== version) {
      throw createConflictError('Este evento fue modificado, recargá la página')
    }

    eventosState[idx] = {
      ...eventosState[idx],
      version: version + 1,
      reserva: { ...eventosState[idx].reserva, estado },
    }
    return clone(eventosState[idx])
  }

  const { data: updated } = await api.patch(`/api/v1/events/${id}/reservation/status`, {
    estado,
    version,
  })
  return updated
}

/**
 * Bloquea temporalmente un horario para la creación de un evento.
 * @param {Object} datos - { fecha, horaInicio, horaFin, tipoEventoId }
 * @returns {Promise<Object>} reserva temporal
 */
export async function bloquearHorario(datos) {
  if (USE_MOCK) {
    await delay(500)
    const expiracion = new Date(Date.now() + 10 * 60 * 1000)

    return {
      id: nextId('reserva-temp'),
      ...datos,
      estado: 'pendiente',
      expirationAt: expiracion.toISOString(),
    }
  }

  const { data } = await api.post('/events/lock', datos)
  return data
}

/**
 * Libera un horario bloqueado.
 * @param {string} reservaId
 * @returns {Promise<Object>}
 */
export async function liberarHorario(reservaId) {
  if (USE_MOCK) {
    await delay(200)
    return { success: true }
  }

  const { data } = await api.delete(`/events/lock/${reservaId}`)
  return data
}

/**
 * Devuelve los eventos de una fecha específica.
 * @param {string} fecha - 'YYYY-MM-DD'
 * @returns {Promise<{ eventos: Array }>}
 */
export async function getDisponibilidad(fecha) {
  if (USE_MOCK) {
    await delay()
    const eventos = eventosState.filter((e) => e.fecha === fecha && e.estado !== 'cancelado')
    return { eventos: clone(eventos) }
  }

  const { data } = await api.get('/api/v1/events/availability', { params: { fecha } })
=======
 * Devuelve los horarios de inicio disponibles para un tipo de evento en una fecha dada.
 * Ventana operativa: 08:00 – 23:00, pasos de 30 minutos.
 * Un slot es válido si el intervalo [inicio, inicio + duracion + limpieza) no se superpone
 * con ningún intervalo ocupado [evento.horaInicio, evento.horaFin + tipo.limpiezaMinutos).
 *
 * @param {string} fecha - 'YYYY-MM-DD'
 * @param {number} tipoEventoId
 * @returns {Promise<string[]>} Array de horarios disponibles en formato 'HH:mm'
 */
export async function getDisponibilidad(fecha, tipoEventoId) {
  if (USE_MOCK) {
    await delay()

    const tipo = tiposEventoMock.find((t) => t.id === Number(tipoEventoId))
    if (!tipo) return []

    // Intervalos ocupados del día: [inicio, fin + limpieza) en minutos
    const eventosDia = eventosState.filter((e) => e.fecha === fecha && e.estado !== 'cancelado')
    const ocupados = eventosDia.map((e) => {
      const tipoE = tiposEventoMock.find((t) => t.id === e.tipoEventoId) || { limpiezaMinutos: 0 }
      const inicioMin = toMinutos(e.horaInicio)
      const finBruto = toMinutos(e.horaFin)
      // horaFin puede cruzar medianoche: si finBruto < inicioMin, sumamos 24h
      const finMin = finBruto < inicioMin ? finBruto + 24 * 60 : finBruto
      return { inicio: inicioMin, fin: finMin + tipoE.limpiezaMinutos }
    })

    const disponibles = []
    const VENTANA_INICIO = 8 * 60   // 08:00
    const VENTANA_FIN = 23 * 60     // 23:00
    const PASO = 30

    for (let min = VENTANA_INICIO; min <= VENTANA_FIN; min += PASO) {
      const finSlot = min + tipo.duracionMinutos + tipo.limpiezaMinutos
      const superpone = ocupados.some((o) => min < o.fin && finSlot > o.inicio)
      if (!superpone) {
        const pad = (n) => String(n).padStart(2, '0')
        disponibles.push(`${pad(Math.floor(min / 60))}:${pad(min % 60)}`)
      }
    }

    return disponibles
  }

  const { data } = await api.get('/api/v1/events/availability', {
    params: { date: fecha, eventTypeId: tipoEventoId },
  })
>>>>>>> origin/develop
  return data
}
