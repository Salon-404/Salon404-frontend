import axios from 'axios';
import { services } from './endpointsUrl';
import { getUserById } from './authService'
import { TOKEN_KEY } from '../constants/auth'
import { decodeToken } from '../globals/decodeToken'
import {
  getEventoReservaId,
  normalizeEstadoEvento,
  normalizeEstadoReserva,
} from '../utils/eventos'

const api = axios.create({
  baseURL: services.eventos,
})
let authLookupDisabled = false

function unwrapList(responseData) {
  if (Array.isArray(responseData)) return responseData
  if (Array.isArray(responseData?.data)) return responseData.data
  if (Array.isArray(responseData?.items)) return responseData.items
  if (Array.isArray(responseData?.result)) return responseData.result
  if (Array.isArray(responseData?.results)) return responseData.results
  if (Array.isArray(responseData?.value)) return responseData.value
  if (Array.isArray(responseData?.Value)) return responseData.Value
  return []
}

function normalizeReserva(reserva) {
  if (!reserva) return null
  return {
    ...reserva,
    estado: normalizeEstadoReserva(reserva.estado ?? reserva.status ?? reserva.statusName ?? reserva.statusId),
    montoTotal: reserva.montoTotal ?? reserva.totalAmount ?? 0,
    creadoEn: reserva.creadoEn ?? reserva.createdAt,
    expiraEn: reserva.expiraEn ?? reserva.expirationAt,
    fechaPago: reserva.fechaPago ?? reserva.paymentDate,
  }
}

async function getReservasById(signal) {
  try {
    const { data } = await axios.get(services.reservation, { signal })
    return new Map(
      unwrapList(data)
        .map(normalizeReserva)
        .filter(Boolean)
        .map((reserva) => [reserva.id, reserva])
    )
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') throw error
    return new Map()
  }
}

function normalizeUsuario(id, user) {
  if (!id || !user) return null
  return {
    id,
    nombre: [user.name ?? user.nombre, user.lastName ?? user.apellido]
      .filter(Boolean)
      .join(' ')
      .trim(),
    email: user.email,
    telefono: user.phone ?? user.telefono,
  }
}

function getCurrentUserFromToken() {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null
    const decoded = decodeToken(token)
    if (!decoded?.id) return null
    return normalizeUsuario(decoded.id, {
      name: decoded.name ?? decoded.nombre,
      email: decoded.email,
      phone: decoded.phone ?? decoded.telefono,
    })
  } catch {
    return null
  }
}

async function getUsuariosById(eventos) {
  const ownerIds = [...new Set(
    eventos
      .map((evento) => evento?.cliente?.id ?? evento?.client?.id ?? evento?.eventOwner)
      .filter(Boolean)
  )]
  const currentUser = getCurrentUserFromToken()
  const localEntries = currentUser ? [[currentUser.id, currentUser]] : []
  const pendingIds = ownerIds.filter((id) => id !== currentUser?.id)

  if (authLookupDisabled || pendingIds.length === 0) {
    return new Map(localEntries)
  }

  const entries = await Promise.all(
    pendingIds.map(async (id) => {
      try {
        const user = await getUserById(id)
        return [id, normalizeUsuario(id, user)]
      } catch {
        authLookupDisabled = true
        return [id, null]
      }
    })
  )

  return new Map([...localEntries, ...entries.filter(([, user]) => user)])
}

function normalizeEvento(evento, reservasById, usuariosById = new Map()) {
  const reservaId = getEventoReservaId(evento)
  const reserva = normalizeReserva(evento.reserva ?? evento.reservation)
    ?? reservasById.get(reservaId)
    ?? null
  const cliente = evento.cliente
    ?? evento.client
    ?? evento.customer
    ?? usuariosById.get(evento.eventOwner)
    ?? null

  return {
    ...evento,
    id: evento.id ?? evento.eventId,
    nombre: evento.nombre ?? evento.eventName,
    descripcion: evento.descripcion ?? evento.description,
    tipoEventoId: evento.tipoEventoId ?? evento.eventTypeId,
    fecha: evento.fecha ?? evento.eventDate,
    horaInicio: evento.horaInicio ?? evento.eventStart,
    horaFin: evento.horaFin ?? evento.eventFinish,
    estado: normalizeEstadoEvento(evento.estado ?? evento.status ?? evento.statusName ?? evento.eventStatusId),
    cantidadInvitados: evento.cantidadInvitados ?? evento.estimatedGuests ?? evento.estimedGuests,
    cliente,
    reserva,
  }
}

/**
 * Devuelve todos los eventos, con filtros opcionales.
 */
export async function getEventos(filtros = {}, signal) {
  const { data } = await api.get("", {
    params: filtros,
    signal,
  })
  const eventos = unwrapList(data)
  const reservasById = await getReservasById(signal)
  const usuariosById = await getUsuariosById(eventos)
  return eventos.map((evento) => normalizeEvento(evento, reservasById, usuariosById));
}

/**
 * Devuelve un evento por id.
 */
export async function getEvento(id) {
  const reservasById = await getReservasById()
  const { data } = await api.get('', {
    params: { EventId: id },
  })
  const evento = unwrapList(data)[0]
  if (!evento) {
    const notFound = new Error('Evento no encontrado')
    notFound.response = { status: 404 }
    throw notFound
  }
  const usuariosById = await getUsuariosById([evento])
  return normalizeEvento(evento, reservasById, usuariosById)
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
  const { data } = await api.post('', evento)
  return data
}

/**
 * Actualiza un evento existente.
 */
export async function updateEvento(id, evento) {
  if (evento.nombre != null) {
    await api.patch(`/${id}/name`, {
      eventId: id,
      eventName: evento.nombre,
    })
  }

  if (evento.descripcion != null) {
    await api.patch(`/${id}/description`, {
      eventId: id,
      description: evento.descripcion,
    })
  }

  if (evento.cantidadInvitados != null) {
    await api.patch('/guests', {
      eventId: id,
      estimedGuests: evento.cantidadInvitados,
    })
  }

  return getEvento(id)
}

/**
 * Cambia el estado del evento.
 */
export async function updateEstadoEvento(
  id,
  estado,
  version
) {
  if (estado === 'cancelado') {
    await api.patch(`/${id}/cancel`)
    return getEvento(id)
  }

  const { data } = await api.patch(
    `/${id}/status`,
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
    `/${id}/reservation/status`,
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
    '/lock',
    datos
  )

  return data
}

/**
 * Libera un horario bloqueado.
 */
export async function liberarHorario(reservaId) {
  const { data } = await api.delete(
    `/lock/${reservaId}`
  )

  return data
}

/**
 * Devuelve la disponibilidad de una fecha.
 */
export async function getDisponibilidad(fecha) {
  const { data } = await api.get(
    '/availability',
    {
      params: { fecha },
    }
  )

  return data
}
