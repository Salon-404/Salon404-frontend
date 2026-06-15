import axios from 'axios'
import { eventosMock } from '../mocks/eventosMock'
import { tiposEventoMock } from '../mocks/tiposEventoMock'
import { sumarMinutos } from '../constants/eventos'

// Poner en false cuando el backend de David esté listo
const USE_MOCK = true

const api = axios.create({
  baseURL: import.meta.env.VITE_API_EVENTOS_URL,
})

// Copia local para simular persistencia durante la sesión
let eventosState = JSON.parse(JSON.stringify(eventosMock))

let _nextId = 1000
function nextId() { return `evt-mock-${_nextId++}` }

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Convierte 'HH:mm' a minutos desde medianoche
function toMinutos(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

/**
 * Devuelve todos los eventos, con filtros opcionales.
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
  return data
}

/**
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
  const { data } = await api.get(`/api/v1/events/${id}`)
  return data
}

/**
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
  return data
}

/**
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
  const { data: created } = await api.post('/api/v1/events', data)
  return created
}

/**
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
  return updated
}

/**
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
  return data
}
